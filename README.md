# Gitbook to Markdown exporter

## Getting started

```bash
# - ! This must be re-run if you make any changes to the scripts (get-content.ts, parse-pages.ts, etc)
npm run build

# Fetch and parse an entire space
# - ℹ️ If your spaces are under the user's "Personal" rather than in an organization, use "personal" as the organization id.
API_TOKEN=xxxx npm run get-content -- [organization id | "personal"]
API_TOKEN=xxxx npm run get-pages -- [space name]
npm run parse-pages -- [space name]

# See documents in data/*

# OR
# Parse a single page
npm run gitbook-to-md -- [Space Name] [data/space-name/subfolder/page.json]
```

## GitBook Hints

[GitBook Hints](https://docs.gitbook.com/content-creation/blocks/hint) _(aka ['call-outs'](https://docs.readme.com/rdmd/docs/callouts) or ['admonitions'](https://squidfunk.github.io/mkdocs-material/reference/admonitions/))_ are not natively supported in Markdown. For now, they are rendered as a block quote with an emoji, e.g.:

> ⏹️ An informational hint

## Images in GitBook

If the image information is available in the GitBook Spaces API response (under `files`), it will be fetched based on the ID and the GitBook download URL will be part of the rendered output.

_Why not just set the download URL as the image link?_

We don't want users migrating away from GitBook to get a false sense of security and forget to find a new host for their images. It would be very easy to let the GitBook CDN _"just work"_ for a while, serving the images happily and making the migration look finished -- until the day it doesn't because GB deleted them💥.

## Contributions

When developing changes to the scripts, be sure to run `npm run build` before QA testing, to ensure you have the latest version.

### Testing

```bash
# Run tests
npm run test

# Continually watch tests
npm run test:watch

# Check types
npm run types
```

## Credits

H/T to [Steven G. Harms](https://gist.github.com/sgharms) whose [gist](https://gist.github.com/sgharms/cb9451b35dfa88543f5c62694aa07c03) kick-started this project.
