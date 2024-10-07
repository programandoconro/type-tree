import { parseArgs } from "util";

export function getArgs(): Args {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      target: {
        type: "string",
      },
      config: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (!values?.target) {
    console.error(
      "There is no target, please add --target with the path to your target file",
    );
  }
  if (!values?.config) {
    console.error(
      "There is no config file, please add --config with the path to ts config target file",
    );
  }

  return values;
}
type Args = {
  target?: string;
  config?: string;
};
