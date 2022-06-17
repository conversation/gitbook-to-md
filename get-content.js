#!/usr/bin/env node

const fs = require("fs").promises;
const axios = require("axios").default;

const apiToken = process.env.API_TOKEN;
const orgId = process.env.ORG_ID;

const config = { headers: { Authorization: `Bearer ${apiToken}` } };

const getContent = async () => {
  try {
    await fs.mkdir(`data`);
  } catch (error) {}

  const spaces = await axios.get(
    `https://api.gitbook.com/v1/owners/${orgId}/spaces`,
    config
  );

  for (space of spaces.data.items) {
    console.log(space.title);
    try {
      await fs.mkdir(`data/${space.title}`);
    } catch (error) {}
    const content = await axios.get(
      `https://api.gitbook.com/v1/spaces/${space.id}/content`,
      { ...config, responseType: "stream" }
    );

    const f = await fs.open(`data/${space.title}/content.json`, "w");
    content.data.pipe(f.createWriteStream());
  }
};

getContent().then(() => console.log("Done"));
