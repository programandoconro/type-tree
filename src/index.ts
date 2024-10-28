import { getArgs } from "../utils/get-args";
import createTypeTree from "./create-type-tree";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const PORT = process.env.PORT ?? 3001;
const { root } = getArgs();
const basePath = root?.endsWith("/") ? root : root + "/";
console.log("The root of you project is" + basePath + "\n");

const tsconfig = basePath + "tsconfig.json";
console.log(`Config file is ${tsconfig} \n`);

Bun.serve({
  port: PORT,
  fetch(req) {
    console.log(`Ready: Serving on http://localhost:${PORT} \n`);
    const url = new URL(req.url);
    const requestedPath = join(basePath, url.pathname);

    if (requestedPath.endsWith(".ico")) {
      return new Response("Favicon");
    }

    const isTypescriptFile =
      requestedPath.endsWith(".ts") || requestedPath.endsWith(".tsx");

    try {
      const stats = statSync(requestedPath);

      if (stats.isDirectory()) {
        const files = readdirSync(requestedPath);
        const fileList = files
          .map((file) => {
            const filePath = join(url.pathname, file);
            const isDir = statSync(join(requestedPath, file)).isDirectory();
            return `<li><a href="${filePath}">${file}${isDir ? "/" : ""}</a></li>`;
          })
          .join("");

        const html = `<html><body><h1>Index of ${url.pathname}</h1><ul>${fileList}</ul></body></html>`;
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (!isTypescriptFile) {
        console.log(`${requestedPath} is not a .ts or .tsx file`);
        return new Response(Bun.file(requestedPath));
      }

      console.log(
        `Analizing ${requestedPath}.\n\nPlease wait 5 seconds ...  \n`,
      );
      const typeTree = JSON.stringify(
        createTypeTree(requestedPath, "", tsconfig),
      );
      console.log("DONE!!\n");
      return new Response(typeTree);
    } catch (error) {
      console.error(error);
      return new Response("There was an error " + error, { status: 500 });
    }
  },
});
