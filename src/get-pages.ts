import { promises as fs } from "fs";
import axios from "axios";

if (process.env.API_TOKEN === undefined) {
  console.error("Please provide the API_TOKEN environment variable");
  process.exit(1);
}
if (process.argv.length < 2) {
  console.error("Usage: npm run get-pages -- [space_name]");
  process.exit(1);
}

const apiToken: string = process.env.API_TOKEN;
const spaceName: string = process.argv[2];

// Given a content file, fetch full page tree
// https://api.gitbook.com/v1/spaces/-L_QCWGtUHVydtMhrF6P/content/url/platform-team-on-boarding

const config = { headers: { Authorization: `Bearer ${apiToken}` } };

type Node = {
  path?: string;
  pages: Node[];
};

const fetchPath = (spaceName: string, spaceId: string, path: string, node: Node) => {
  const absNodePath = node.path ? `${path}/${node.path}` : path;

  if (node.path !== undefined) {
    console.log(absNodePath);
  }

  for (const page of node.pages) {
    fetchPath(spaceName, spaceId, absNodePath, page);
  }
};

const getPages = async (spaceName: string) => {
  const content = JSON.parse(
    await fs.readFile(`data/${spaceName}/content.json`, "utf8")
  );

  fetchPath(spaceName, content.id, "", content);
};

getPages(spaceName).then(() => console.log("Done"));
