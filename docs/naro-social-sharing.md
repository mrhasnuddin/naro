# NARO social sharing

Two branded cards use the existing wordmark, Noto Sans typography and shared mint/dark design tokens. Both clearly identify the BNB testnet learning demo.

| File in `frontend/public/social/` | Dimensions | Use |
| --- | --- | --- |
| `naro-landscape.png` | 1200 × 630 | Default Open Graph image and X large-image card. |
| `naro-square.png` | 1200 × 1200 | Square posts and alternate Open Graph image. |

Self-contained SVG sources are included beside the PNGs. `python frontend/scripts/build-social-sources.py` rebuilds those SVGs using the shared tokens and original wordmark. It uses only the Python standard library. To regenerate PNG exports, open each SVG in a browser, allow its embedded font to load, set the viewport to its intrinsic dimensions and capture the viewport at 1× scale. Verify that each resulting PNG matches the dimensions above. Keep the original asset licenses.

## Public URLs

`frontend/vite.config.ts` inserts social metadata into the built HTML, so crawlers do not need JavaScript. It includes image dimensions, descriptions and a landscape-first Open Graph order. Individual platforms decide which image to use and how to crop it; the square alternative does not force a square preview everywhere. See the [Open Graph protocol](https://ogp.me/) for image arrays and ordering.

On Vercel, builds use `VERCEL_PROJECT_PRODUCTION_URL` for absolute image and canonical URLs. Enable access to System Environment Variables in the Vercel project if disabled. A custom `VITE_SITE_URL` overrides that value, for example when moving to a custom domain or a different host. This is a public website URL, never a secret. See [Vercel's production URL documentation](https://vercel.com/docs/environment-variables/system-environment-variables#vercel_project_production_url).

Local builds without either value use relative image paths and omit canonical/og:url instead of inventing a domain. A Vercel build without both values fails with a configuration message to prevent publishing broken social image URLs.

After a public deployment, check the raw page HTML and both `/social/naro-landscape.png` and `/social/naro-square.png` URLs without being signed in. Social crawlers must be able to access the website and images without Vercel authentication. Social platforms can cache previews; a redeployment alone may not refresh an existing cached share.

Local validation: both PNG sizes and image references were checked, both layouts were visually inspected, and an isolated build with a simulated production domain verified the absolute URLs and metadata order. Public social-platform previews remain untested until the deployed URL is available.
