import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

const getDirectories = (source: string) => {
  const rd = fs.readdirSync(source, { withFileTypes: true });
  return rd.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
};

const alias = getDirectories("./src").map(dir => {
  return {
    find: `@${dir}`,
    replacement: path.resolve(__dirname, `./src/${dir}`),
  };
});

export default defineConfig({
  root: "src/client",
  resolve: { alias },
});
