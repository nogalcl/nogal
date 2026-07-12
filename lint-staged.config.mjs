import path from "node:path";

function relativeTo(dir, files) {
  const root = path.join(process.cwd(), dir);
  return files.map((file) => path.relative(root, file)).join(" ");
}

export default {
  "apps/web/**/*.{ts,tsx,js,jsx}": (files) =>
    `pnpm --dir apps/web exec eslint --fix ${relativeTo("apps/web", files)}`,
  "apps/api/**/*.ts": (files) =>
    `pnpm --dir apps/api exec eslint --fix ${relativeTo("apps/api", files)}`,
  "**/*.{json,md,css}": "prettier --write",
};
