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

⚠️ Work in Progress - for now, images end up as either a simple ref (`files/-Mered4r4t0g.png`) or `undefined`. There is enough information returned from GitBook API we can update to the actual CDN download links, to make it easy for users to get the images back.

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
