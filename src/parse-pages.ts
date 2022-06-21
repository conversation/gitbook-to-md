import { promises as fs } from "fs";
import convertToMarkdown from "./convertToMarkdown.js";

if (process.argv.length < 2) {
  console.error("Usage: npm run parse-pages -- [space name]");
  process.exit(1);
}

const spaceName: string = process.argv[2];

const readDir = async (path: string) => {
  const filenames = await fs.readdir(path);

  for (const file of filenames) {
    const absPath = `${path}/${file}`;

    const stat = await fs.lstat(absPath);

    if (stat.isDirectory()) {
      readDir(absPath);
    } else if (file.match(/\.json$/)) {
      console.log(`${absPath} -> ${absPath.replace(".json", ".md")}`);
      const markdown = await convertToMarkdown(absPath);
      fs.writeFile(absPath.replace(".json", ".md"), markdown);
    }
  }
};

readDir(`data/${spaceName}`).then(() => console.log("Done"));
