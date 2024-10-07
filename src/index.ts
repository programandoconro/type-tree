import { getArgs } from "../utils/get-args";
import createTypeTree from "./create-type-tree";

const PORT = process.env.PORT ?? 3001;
const { target, config } = getArgs();

const typeTree = target
  ? createTypeTree(target, undefined, config)
  : "Please add --target with your target file path and --config with your ts-config file path when starting the server";

Bun.serve({
  port: PORT,
  fetch(_req) {
    return new Response(JSON.stringify(typeTree));
  },
});
