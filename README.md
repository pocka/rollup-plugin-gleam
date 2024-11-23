<!--
SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
SPDX-License-Identifier: Apache-2.0
-->

# rollup-plugin-gleam

A [Rollup](https://rollupjs.org/) plugin that add supports for [Gleam](https://gleam.run/) language. Also compatible with [Vite](https://vite.dev/).

- Source code is available at [github.com:pocka/rollup-plugin-gleam](https://github.com/pocka/rollup-plugin-gleam)
- Package is available as [npm:`@pocka/rollup-plugin-gleam`](https://npmjs.com/package/@pocka/rollup-plugin-gleam)

## Requirements

This plugin requires Rollup >= v1.12.0 and a working Gleam executable (`gleam`).

## Usage

Import the plugin in your `rollup.config.js` or `vite.config.js`:

```js
import { gleam } from "@pocka/rollup-plugin-gleam";

export default {
	// ...
	plugins: [gleam()],
};
```

Then you can import `.gleam` files:

```gleam
// hello.gleam
pub fn hello(name: String) -> String {
  "Hello, " <> name
}
```

```js
import { hello } from "./hello.gleam";

console.log(hello("World"));
```

## Options

### `gleamToml`

- Type: `URL` or String
- Default: `"./gleam.toml"`

File path or file URL to `gleam.toml`.
If the value is relative path string, this plugin resolves the path from current working directory.

```js
gleam({
	gleamToml: new URL("./gleam.toml", import.meta.url),
});
```

### `bin`

- Type: String
- Default: `"gleam"`

Binary name or path to Gleam executable file.
This plugin builds Gleam file using this value.

```js
gleam({
	bin: "/path/to/gleam",
});
// > /path/to/gleam build --target javascript
```

### `buildOptions.warningAsErrors`

- Type: Boolean
- Default: `false`

This option activates `--warning-as-errors` compiler flag.
If this option is enabled, warning made by Gleam compiler will be treated as a build error.

```js
gleam({
	buildOptions: {
		warningAsErrors: true,
	},
});
```

```gleam
// This won't compile with the flag on, due to an unused variable warning.
pub fn hello(name: String) -> String {
  "Hello World!"
}
```

## License

This software is licensed under [Apache License Version 2.0](./LICENSES/Apache-2.0.txt).

This project adheres to [REUSE Specification](https://reuse.software/spec-3.3/).
Every checked-in file has copyright and license information inside a comment header, adjacent `*.license` file, or [REUSE.toml](./REUSE.toml) file.
