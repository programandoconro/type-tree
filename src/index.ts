import { getArgs } from "../utils/get-args";
import createTypeTree from "./create-type-tree";

const PORT = process.env.PORT ?? 3001;
const { config } = getArgs();

const typeTree = (target?: string) =>
  target
    ? createTypeTree(target, undefined, config)
    : "Please add `?path=` in url with your target file path.";

console.log(`Ready: Serving on port ${PORT}`);

Bun.serve({
  port: PORT,
  fetch(req) {
    const searchParams = new URLSearchParams(req.url);
    let path = "";
    for (const [key, value] of searchParams) {
      if (key.includes("path")) {
        path = value;
      }
    }
    return new Response(JSON.stringify(typeTree(path)));
  },
});
