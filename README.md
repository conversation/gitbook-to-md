# Gitbook to Markdown exporter

## Getting started

```bash
npm run build

# Fetch and parse an entire space
# -- ℹ️ If your spaces are under the user's "Personal" rather than in an organization, use "personal" as the organization id.
API_TOKEN=xxxx npm run get-content -- [organization id | "personal"]
API_TOKEN=xxxx npm run get-pages -- [space name]
npm run parse-pages -- [space name]

# See documents in data/

# Parse a single page
npm run gitbook-to-md -- [page.json]
```

## GitBook Hints

Hints _(aka 'call-outs' or 'admonitions')_ are not natively supported in Markdown. For now, they are rendered as a block quote.

## Images in GitBook

If the image information is available in the GitBook Spaces API response (under `files`), it will be fetched based on the ID and the GitBook download URL will be part of the rendered output.

_Why not just set the download URL as the image link?_

We don't want users migrating away from the service to get a false sense of security and forget to find a new host for their images. It would be very easy to let the GitBook CDN "just work" for a bit, serving the images happily and making the migration look successful - up until the day it doesn't 💥.

## Contributions

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
