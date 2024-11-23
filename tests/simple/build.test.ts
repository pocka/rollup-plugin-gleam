// Test suites for basic features.
//
// SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { rollup } from "rollup";
import { describe, expect, it } from "vitest";

import { gleam } from "../../src/plugin";

describe("Simple Gleam code", () => {
	it("Should transpile Gleam files to JS files", async ({ onTestFinished }) => {
		const build = await rollup({
			input: new URL("./src/main.js", import.meta.url).pathname,
			plugins: [
				gleam({
					gleamToml: new URL("./gleam.toml", import.meta.url),
				}),
			],
		});

		onTestFinished(() => build.close());

		const { output } = await build.generate({});

		expect(output).toHaveLength(1);
		expect(output[0].code).toMatch("function hello_world(");
		expect(output[0].code).toMatch("function hello(");
		expect(build.watchFiles.some((id) => id.endsWith("/src/main.gleam"))).toBe(true);
		expect(build.watchFiles.some((id) => id.endsWith("/src/hello.gleam"))).toBe(true);
		expect(
			output[0].moduleIds.some((id) =>
				id.endsWith("/dev/javascript/test_simple/hello.mjs"),
			),
		).toBe(true);
	});

	it("Should abort build if gleam.toml does not exist", async () => {
		await expect(() =>
			rollup({
				input: new URL("./src/main.js", import.meta.url).pathname,
				plugins: [
					gleam({
						gleamToml: new URL("./not_gleam.toml", import.meta.url),
					}),
				],
			}),
		).rejects.toThrow();
	});
});
