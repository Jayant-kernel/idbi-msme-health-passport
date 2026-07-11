import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

mkdirSync("dist/server", { recursive: true });
mkdirSync("dist/.openai", { recursive: true });
copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");

const assets = readdirSync("dist/assets");
const cssFile = assets.find((file) => file.endsWith(".css"));
const jsFile = assets.find((file) => file.endsWith(".js"));
const css = cssFile ? readFileSync(`dist/assets/${cssFile}`, "utf8") : "";
const js = jsFile ? readFileSync(`dist/assets/${jsFile}`, "utf8") : "";
const favicon = readFileSync("dist/favicon.svg", "utf8");
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MSME Financial Health Passport</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${js}</script>
  </body>
</html>`;

writeFileSync(
  "dist/server/index.js",
  `export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/favicon.svg") {
      return new Response(${JSON.stringify(favicon)}, {
        headers: { "content-type": "image/svg+xml; charset=utf-8" }
      });
    }
    return new Response(${JSON.stringify(html)}, {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
};
`
);
