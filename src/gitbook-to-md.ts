import convertToMarkdown from "./convertToMarkdown.js";

const processFile: string = process.argv[2];

convertToMarkdown(processFile).then((markdown) => {
  console.log(markdown);
});
