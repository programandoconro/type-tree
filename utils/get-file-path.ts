import { parseArgs } from "util";

export function getFilePath(): string | undefined {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      path: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (!values?.path) {
    console.error("There is no path, please add --path to file");
  }

  return values.path;
}
