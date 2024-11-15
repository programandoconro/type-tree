import { parseArgs } from "util";

export function getArgs(): Args {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      root: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (!values?.root) {
    console.error(
      "Using root directory tsconfig.json file because you did not specify add --config with the path to ts config file",
    );
    values.root = "./";
  }

  return values;
}
type Args = {
  root?: string;
};
