// Test suites for building on file changes.
//
// SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { readFile, writeFile } from "node:fs/promises";

import { type RollupWatcherEvent, watch } from "rollup";
import { describe, expect, it } from "vitest";

import { gleam } from "../../src/plugin";

describe("Watch mode", () => {
	it("Should rebuild on a change to .gleam file", async ({ onTestFinished }) => {
		const main = new URL("./src/main.gleam", import.meta.url);

		const originalMain = await readFile(main, { encoding: "utf-8" });

		onTestFinished(() => writeFile(main, originalMain, { encoding: "utf-8" }));

		const watcher = watch({
			output: {
				dir: new URL("./dist", import.meta.url).pathname,
			},
			input: new URL("./src/main.js", import.meta.url).pathname,
			plugins: [gleam({ gleamToml: new URL("./gleam.toml", import.meta.url) })],
		});

		onTestFinished(() => watcher.close());

		const build = () =>
			new Promise<string>((resolve, reject) => {
				const listener = async (event: RollupWatcherEvent) => {
					switch (event.code) {
						case "ERROR":
							reject(event.error);
							break;
						case "BUNDLE_END":
							try {
								const build = await event.result.generate({});
								resolve(build.output[0].code);
							} catch (error) {
								reject(error);
							} finally {
								event.result.close();
							}
							break;
						default:
							return;
					}

					watcher.off("event", listener);
				};

				watcher.on("event", listener);
			});

		expect(await build()).toMatch(`"World"`);

		const [changedCode] = await Promise.all([
			build(),
			writeFile(main, originalMain.replace("World", "John Doe"), {
				encoding: "utf-8",
			}),
		]);

		expect(changedCode).toMatch(`"John Doe"`);
	});

	it("Should rebuild on a change to indirect .gleam file", async ({ onTestFinished }) => {
		const hello = new URL("./src/hello.gleam", import.meta.url);

		const originalHello = await readFile(hello, {
			encoding: "utf-8",
		});

		onTestFinished(() =>
			writeFile(hello, originalHello, {
				encoding: "utf-8",
			}),
		);

		const watcher = watch({
			output: {
				dir: new URL("./dist", import.meta.url).pathname,
			},
			input: new URL("./src/main.js", import.meta.url).pathname,
			plugins: [
				gleam({
					gleamToml: new URL("./gleam.toml", import.meta.url),
				}),
			],
		});

		onTestFinished(() => watcher.close());

		const build = () =>
			new Promise<string>((resolve, reject) => {
				const listener = async (event: RollupWatcherEvent) => {
					switch (event.code) {
						case "ERROR":
							reject(event.error);
							break;
						case "BUNDLE_END":
							try {
								const build = await event.result.generate({});
								resolve(build.output[0].code);
							} catch (error) {
								reject(error);
							} finally {
								event.result.close();
							}
							break;
						default:
							return;
					}

					watcher.off("event", listener);
				};

				watcher.on("event", listener);
			});

		expect(await build()).toMatch(`"Hello "`);

		const [changedCode] = await Promise.all([
			build(),
			writeFile(hello, originalHello.replace("Hello", "Hi"), {
				encoding: "utf-8",
			}),
		]);

		expect(changedCode).toMatch(`"Hi "`);
	});

	it("Should rebuild on a change to gleam.toml", async ({ onTestFinished }) => {
		const gleamToml = new URL("./gleam.toml", import.meta.url);

		const originalGleamToml = await readFile(gleamToml, { encoding: "utf-8" });

		onTestFinished(() => writeFile(gleamToml, originalGleamToml, { encoding: "utf-8" }));

		const watcher = watch({
			output: {
				dir: new URL("./dist", import.meta.url).pathname,
			},
			input: new URL("./src/main.js", import.meta.url).pathname,
			plugins: [gleam({ gleamToml })],
		});

		onTestFinished(() => watcher.close());

		const build = () =>
			new Promise<boolean>((resolve, reject) => {
				const listener = (event: RollupWatcherEvent) => {
					switch (event.code) {
						case "ERROR":
							reject(event.error);
							break;
						case "BUNDLE_END":
							event.result.close();
							resolve(true);
							break;
						default:
							return;
					}

					watcher.off("event", listener);
				};

				watcher.on("event", listener);
			});

		expect(await build()).toBe(true);

		await writeFile(gleamToml, originalGleamToml.replace("1.0.0", "1.0.1"), {
			encoding: "utf-8",
		});

		expect(await build()).toBe(true);
	});
});
