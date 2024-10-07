# Type-Tree

Takes a ts file path and serves json with plain extracted types and interfaces. It facilitates the visualization of nested types, specially when types are imported from different files. You can see it as a type tree creator for your types.

## How to use it:

This project was created using bun [Bun](https://bun.sh), and [ts-morph](https://ts-morph.com/).
Follow the next steps to run it locally.

### Install dependencies:

Note: You can use `npx bun` if you do not want to install bun.

```bash
bun install
```

### Run

```bash
bun run start --target PATH_TO_YOUR_TARGET_TS_FILE --config PATH_TO_YOUR_TSCONFIG_FILE
```

Where `--target` is the absolute path to the file you want to examine and `--config` is the absolute path to your project's tsconfig.json file

### View type tree

Go to http://localhost:3001 to see the extracted types served as a plain tree.

You can also set `PORT` env variable to use different port.

You can use [JSON Formatter](https://chromewebstore.google.com/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa?hl=en) browser extension for better visualization experience.

### Contributions

PRs are always welcome. Please consider adding and running tests for better development experience.

### Test

```bash
bun run test
```
