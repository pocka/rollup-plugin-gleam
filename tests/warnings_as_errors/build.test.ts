// Test suites for `buildOptions.warningAsErrors` option.
//
// SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { rollup } from "rollup";
import { describe, expect, it } from "vitest";

import { gleam } from "../../src/plugin";

describe("warnings_as_errors", () => {
	it("Should abort build on warnings, when enabled", async () => {
		await expect(() =>
			rollup({
				input: new URL("./src/main.js", import.meta.url).pathname,
				plugins: [
					gleam({
						gleamToml: new URL("./gleam.toml", import.meta.url),
						buildOptions: {
							warningsAsErrors: true,
						},
					}),
				],
			}),
		).rejects.toThrow();
	});

	it("Should not abort build on warnings, when disabled", async ({ onTestFinished }) => {
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
		expect(build.watchFiles.some((id) => id.endsWith("/src/main.gleam"))).toBe(true);
	});
});
