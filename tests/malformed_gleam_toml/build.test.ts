// Test suites for handling of malformed manifest file.
//
// SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { rollup } from "rollup";
import { describe, expect, it } from "vitest";

import { gleam } from "../../src/plugin";

describe("Malformed gleam.toml", () => {
	it("Should abort build when gleam.toml is malformed", async () => {
		await expect(() =>
			rollup({
				input: new URL("./src/main.js", import.meta.url).pathname,
				plugins: [
					gleam({
						gleamToml: new URL("./gleam.toml", import.meta.url),
					}),
				],
			}),
		).rejects.toThrow();
	});
});
