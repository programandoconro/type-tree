import { parseArgs } from "util";

export function getArgs(): Args {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      config: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (!values?.config) {
    console.error(
      "There is no config file, please add --config with the path to ts config target file",
    );
  }

  return values;
}
type Args = {
  config?: string;
};
