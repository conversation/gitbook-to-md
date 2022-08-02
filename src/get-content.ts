import { promises as fs } from "fs";
import axios from "axios";

if (process.env.API_TOKEN === undefined) {
  console.error("Please provide the API_TOKEN environment variable");
  process.exit(1);
}
if (process.argv.length < 2) {
  console.error("Usage: npm run get-content -- [organisation_id]");
  process.exit(1);
}

const apiToken: string = process.env.API_TOKEN;
const orgId: string = process.argv[2];

const config = { headers: { Authorization: `Bearer ${apiToken}` } };

const getContent = async () => {
  try {
    await fs.mkdir(`data`);
  } catch (error) { }

  const spaces = await axios.get(
    `https://api.gitbook.com/v1/orgs/${orgId}/spaces`,
    config
  );

  for (let space of spaces.data.items) {
    console.log(space.title);
    try {
      await fs.mkdir(`data/${space.title}`);
    } catch (error) { }
    const content = await axios.get(
      `https://api.gitbook.com/v1/spaces/${space.id}/content`,
      { ...config, responseType: "stream" }
    );

    const f = await fs.open(`data/${space.title}/content.json`, "w");
    content.data.pipe(f.createWriteStream());

    await fs.writeFile(`data/${space.title}/space.id`, space.id);
  }
};

getContent().then(() => console.log("Done"));
