# Gitbook to Markdown exporter

## Getting started

```bash
npm run build

# Fetch and parse an entire space
API_TOKEN=xxxx npm run get-content -- [organisation id]
API_TOKEN=xxxx npm run get-pages -- [space name]
npm run parse-pages -- [space name]

# See documents in data/

# Parse a single page
npm run gitbook-to-md -- [page.json]
```

## Testing

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
