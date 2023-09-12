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
# If you want to have the images embedded in the markdown files, run
DOWNLOAD_IMAGES=true npm run parse-pages -- [space name]

# See documents in data/*

# Images/Files - Download them all in one go
npm run download-files -- [space name]

# OR
# Parse a single page
npm run gitbook-to-md -- [Space Name] [data/space-name/subfolder/page.json]
```

### Copying files with directory structure

If you want to copy over your Markdown files while retaining the directory structure, here's a short script you can use:

```bash
set -x

space_name="$1"
orig_path="./data/${space_name}"
# has to be relative to the orig path
dest="../../../my-mkdocs-repo/docs/${space_name}"

echo "Copying .md from ${orig_path} to ${dest}.."
# without cd, it copies the orig path parent dirs as well, when I had wanted it to start from that folder
cd "${orig_path}"
find . -name '*.md' -exec cp --parents \{\} "${dest}" \;
```

## GitBook Hints

[GitBook Hints](https://docs.gitbook.com/content-creation/blocks/hint) _(aka ['call-outs'](https://docs.readme.com/rdmd/docs/callouts) or ['admonitions'](https://squidfunk.github.io/mkdocs-material/reference/admonitions/))_ are not natively supported in Markdown. For now, they are rendered as a block quote with an emoji, e.g.:

> ⏹️ An informational hint

## Images in GitBook

If the image information is available in the GitBook Spaces API response (under `files`), it will be fetched based on the ID and the GitBook download URL will be part of the rendered output.

_Why not just set the download URL as the image link?_

We don't want users migrating away from GitBook to get a false sense of security and forget to find a new host for their images. It would be very easy to let the GitBook CDN _"just work"_ for a while, serving the images happily and making the migration look finished -- until the day it doesn't because GB deleted them💥.

Example of image Markdown:

```bash
# we use the Markdown `title` section to add the download url as well as local image path & retain the caption
![this is a caption](files/-MGNEGkbb3zWb-CgpWVS.my-image.png "https://files.gitbook.com/v0/b/gitbook-legacy-files/o/assets%2F-M9QNJLU2f5V-QClWeyJ%2F-MGNDIT-xVrbs3pSkW6r%2F-MGNEGkbb3zWb-CgpWVS%2Fmy-image.png?alt=media&token=7879f2b5-9174-4847-a129-11e88ff2dc25")
```

### Automatically embed images

If running the parse-pages script with the environment variable `DOWNLOAD_IMAGES` set to `true`, the images will be downloaded and automatically embedded as `base64` strings. These will render and can be converted to HTML or other formats using `pandoc`.

### Download Script

There is a separate script that will download all the listed files for a Space.

```bash
npm run download-files -- [space name]

# files are then available at data/{space name}/files/{image ID}.{file name}.{extension}
```

> ⏹️ _Images are saved with their `ID` as part of the filename, so duplicate image names should be handled._

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
