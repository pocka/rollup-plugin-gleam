//! Rollup plugin for Gleam language.
//
//! SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
//! SPDX-License-Identifier: Apache-2.0

import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import * as toml from "smol-toml";
import readdirp from "readdirp";
import type { Plugin } from "rollup";

interface GleamTOML {
	name: string;
	version: string;
}

function isGleamTOML(x: unknown): x is GleamTOML {
	if (typeof x !== "object" || !x) {
		return false;
	}

	if (!("name" in x && typeof x.name === "string" && x.name)) {
		return false;
	}

	if (!("version" in x && typeof x.version === "string" && x.version)) {
		return false;
	}

	return true;
}

export interface GleamPluginOptions {
	/**
	 * Path to `gleam.toml` file.
	 * This plugin looks for source directory and build directory based on this file location.
	 *
	 * Current working directory will be used to resolve relative paths.
	 *
	 * @default "./gleam.toml"
	 */
	gleamToml?: URL | string;

	/**
	 * Path to or name of the Gleam binary file to invoke.
	 * @default "gleam"
	 */
	bin?: string;

	buildOptions?: {
		/**
		 * Emit compile time warnings as errors.
		 * Enables `--warnings-as-errors` CLI flag.
		 */
		warningsAsErrors?: boolean;
	};
}

export function gleam({
	bin = "gleam",
	buildOptions = {},
	gleamToml: gleamTomlPathOrUrl = "./gleam.toml",
}: GleamPluginOptions = {}): Plugin {
	/**
	 * Parsed contents of `gleam.toml`.
	 */
	let gleamToml: GleamTOML | null = null;

	const projectRoot =
		typeof gleamTomlPathOrUrl === "string"
			? path.resolve(gleamTomlPathOrUrl, "..")
			: fileURLToPath(new URL("./", gleamTomlPathOrUrl));

	// Gleam expects a project to have `src/` directory at project root.
	const srcDir = path.resolve(projectRoot, "src");

	// Gleam compiler outputs artifacts under `build/` directory at project root.
	// Directory structure inside is not documentated, but this is the only way
	// to access built JS files. There is no way to specify output directory also.
	const jsOutDir = path.resolve(projectRoot, "build/dev/javascript");

	const buildCommandArgs = ["build", "--target", "javascript"];
	if (buildOptions.warningsAsErrors) {
		buildCommandArgs.push("--warnings-as-errors");
	}

	// Build command won't change during the plugin's lifetime.
	// It's fine to bind everything upfront.
	const buildProject = promisify(execFile).bind(null, bin, buildCommandArgs, {
		cwd: projectRoot,
	});

	return {
		name: "gleam",
		async buildStart() {
			// Changes to `gleam.toml` should trigger rerun of this hook.
			// Otherwise, if `name` field got changed for example, Rollup tries to access nonexistent
			// files based on an old name (build/dev/javascript/old_name/foo.mjs).
			this.addWatchFile(
				typeof gleamTomlPathOrUrl === "string"
					? gleamTomlPathOrUrl
					: fileURLToPath(gleamTomlPathOrUrl),
			);

			const parsed = toml.parse(await readFile(gleamTomlPathOrUrl, { encoding: "utf8" }));
			if (!isGleamTOML(parsed)) {
				// TypeScript can't narrow types using `never`. Putting `return` after this line
				// triggers `Unreachable code detected.` so we have to *return never*.
				// <https://github.com/microsoft/TypeScript/issues/12825>
				// Following code contains the same workaround for this reason.
				return this.error(`gleam.toml does not comform to official schema.`);
			}

			gleamToml = parsed;
		},
		async transform(_code, id) {
			// .gleam files imported by non-Gleam modules (e.g. .js, .ts) run through this branch.
			// This branch triggers a build then returns proxy code that re-exports everything from
			// the generated .mjs file.
			if (id.endsWith(".gleam")) {
				if (!gleamToml) {
					return this.error(
						"Unable to resolve transpiled Gleam file without `gleam.toml`.",
					);
				}

				const absPath = path.resolve(srcDir, id);
				if (!absPath.startsWith(srcDir)) {
					this.error("Gleam files must be inside the src/ directory.");
				}

				const modulePath = absPath
					// `+1` ... removing path separator
					.slice(srcDir.length + 1)
					.replace(/\.gleam$/, ".mjs");

				const transpiledMjsPath = path.resolve(jsOutDir, gleamToml.name, modulePath);

				// Scan every .gleam files and watch them. This might be slow when the number
				// of files got large. However, manually watching comes with performance cost
				// too and it also brings management cost (properly closing watcher, reducing
				// the number of watch targets). Since this logic doesn't need file contents,
				// I believe the performance cost it brings is tolerable.
				for await (const entry of readdirp(srcDir)) {
					const resolved = path.resolve(srcDir, entry.path);
					if (!resolved.endsWith(".gleam")) {
						continue;
					}

					// The .gleam file pointed by `id` is already (or will be) in watched files.
					// Adding this results in duplicated watched file.
					if (resolved === id) {
						continue;
					}

					this.addWatchFile(resolved);
				}

				// Build after starting watching other .gleam files.
				// Otherwise fixing an error in another file does not trigger rebuild, which
				// leaves bundler stucked in an error state.
				await buildProject();

				return {
					code: `export * from ${JSON.stringify(transpiledMjsPath)}`,
				};
			}
		},
	};
}

export default gleam;
