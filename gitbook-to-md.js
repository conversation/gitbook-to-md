#!/usr/bin/env node
const fs = require("fs");
const MarkdownRenderer = require("./MarkdownRenderer");

const processFile = process.argv[2];

fs.readFile(processFile, "utf8", (err, data) => {
  const renderer = new MarkdownRenderer();
  const output = renderer.render(JSON.parse(data).document);
  console.log(output);
});
