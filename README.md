# Type-Tree

Takes a ts file path and serves json with plain extracted types and interfaces. It facilitates the visualization of nested types, specially when types are imported from different files. You can see it as a type tree creator for your types.

You can use it in the browser or as a VScode extension

## How to use it:

### As a VScode extension

Go to this [./ext/README.md](./ext/README.md) for details

### In the browser

This project was created using bun [Bun](https://bun.sh), and [ts-morph](https://ts-morph.com/).
Follow the next steps to run it locally.

### Install dependencies:

Note: You can use `npx bun` if you do not want to install bun.

```bash
bun install
// or npx bun install
```

### Run

```bash
bun run start --config PATH_TO_YOUR_TSCONFIG_FILE
// or npx bun run start --config PATH_TO_YOUR_TSCONFIG_FILE
```

Where `--config` should have the path to your project's tsconfig.json file. This will default to the root directory `tsconfig.json` file if `--config` is not provided.

### View type tree

Go to http://localhost:3001/?path=PATH_TO_YOUR_TARGET_TS_FILE to see the extracted types served as a plain tree.

Please add a `?path=` [query string](https://en.wikipedia.org/wiki/Query_string) with your target ts file to analyze.

Note: You can also set a different `PORT` env variable if 3001 is not available.

I recommend using [JSON Formatter](https://chromewebstore.google.com/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa?hl=en) browser extension for better visualization experience.

### Contributions

PRs are always welcome. Please consider adding and running tests for better development experience.

### Test

```bash
bun run test
```
