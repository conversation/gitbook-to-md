import { promises as fs } from "fs";
import MarkdownRenderer from "./MarkdownRenderer";

const processFile: string = process.argv[2];

fs.readFile(processFile, "utf8").then((data) => {
  const renderer = new MarkdownRenderer();
  const output: string = renderer.render(JSON.parse(data).document);
  console.log(output);
});
