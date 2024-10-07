import { getFilePath } from "../utils/get-file-path";
import createTypeTree from "./create-type-tree";

const PORT = process.env.PORT ?? 3001;
const FILE_PATH = getFilePath();

const typeTree = FILE_PATH
  ? createTypeTree(FILE_PATH)
  : "Please add a file path using --path when starting the server";

Bun.serve({
  port: PORT,
  fetch(_req) {
    return new Response(JSON.stringify(typeTree));
  },
});
