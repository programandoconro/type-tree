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
      "Using root directory tsconfig.json file because you did not specify add --config with the path to ts config file",
    );
    values.config = "tsconfig.json";
  }

  return values;
}
type Args = {
  config?: string;
};
