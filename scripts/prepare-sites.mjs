import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

mkdirSync("dist/server", { recursive: true });
mkdirSync("dist/.openai", { recursive: true });
copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");

writeFileSync(
  "dist/server/index.js",
  `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || url.pathname.includes(".")) {
      return response;
    }
    return env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
  }
};
`
);
