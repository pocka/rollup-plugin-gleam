// Test suites for Vite compatibility.
//
// SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";
import { describe, expect, it, vitest } from "vitest";

import { gleam } from "../../src/plugin";

describe("Vite compatibility", () => {
	it("Should rebuild on a change to .gleam file", async ({ onTestFinished }) => {
		const app = new URL("./src/app.gleam", import.meta.url);

		const originalApp = await readFile(app, { encoding: "utf-8" });

		onTestFinished(() => writeFile(app, originalApp, { encoding: "utf-8" }));

		const server = await createServer({
			configFile: false,
			root: fileURLToPath(new URL(".", import.meta.url)),
			logLevel: "warn",
			plugins: [
				gleam({
					gleamToml: new URL("./gleam.toml", import.meta.url),
				}),
			],
		});

		await server.listen();
		onTestFinished(() => server.close());

		await server.warmupRequest("/src/main.js");
		await server.waitForRequestsIdle();

		const appMjsBefore = await server.transformRequest(
			"/build/dev/javascript/test_vite/app.mjs",
		);
		expect(appMjsBefore!.code).toMatch(`"World"`);

		await writeFile(app, originalApp.replace("World", "Gleam"), {
			encoding: "utf-8",
		});

		// Vite seems to have no way to test HMR/watch things from outside.
		// Unfortunately polling is the most reliable option.
		await vitest.waitFor(async () => {
			const appMjsAfter = await server.transformRequest(
				"/build/dev/javascript/test_vite/app.mjs",
			);
			expect(appMjsAfter!.code).toMatch(`"Gleam"`);
		});
	});
});
