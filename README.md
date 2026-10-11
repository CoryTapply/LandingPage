# Zerpy landing page

The landing page for [zerpy.dev](https://zerpy.dev): an animated "Under construction" hero followed by link cards to other projects.

It is a static React site (Vite + TypeScript) served by nginx from a Cloud Run service. Every push to `main` deploys automatically.

## Run it locally

Requires Node 22 or newer.

```sh
npm install
npm run dev        # dev server at http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run typecheck` | Type-check with `tsc` |
| `npm test` | Unit tests for the animation timing math (Vitest) |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

## Deploying changes

Push to `main`. That is the whole process.

```sh
npm run typecheck && npm test   # the deploy runs these too, and stops if they fail
git add -A
git commit -m "Describe the change"
git push
```

`.github/workflows/deploy.yml` then:

1. runs the type-check and tests;
2. builds the Docker image and pushes it to Artifact Registry, tagged with the commit SHA;
3. deploys that image to the `landingpage` Cloud Run service.

It takes a couple of minutes. To follow it:

```sh
gh run watch                    # or: the Actions tab on GitHub
```

The site is live as soon as the run goes green. `index.html` is served with `no-cache`, so visitors get the new version on their next load.

### Other ways to deploy

- **Redeploy without a code change**: run the "Deploy to Cloud Run" workflow from the Actions tab, or `gh workflow run deploy.yml`.
- **Roll back**: revert the commit and push (`git revert <sha> && git push`), or route traffic to an earlier revision:

  ```sh
  gcloud run revisions list --service=landingpage --region=us-central1 --project=raidschedule
  gcloud run services update-traffic landingpage --to-revisions=<REVISION>=100 --region=us-central1 --project=raidschedule
  ```

- **Manual deploy from your machine**, plus the one-time GCP setup, permissions and DNS records: see [`deploy/cloudrun/README.md`](deploy/cloudrun/README.md).

## Where it runs

| | |
| --- | --- |
| Site | `zerpy.dev` (`www.zerpy.dev` redirects to it) |
| GCP project / region | `raidschedule` / `us-central1` |
| Cloud Run service | `landingpage` (scale-to-zero, max 2 instances) |
| Direct service URL | https://landingpage-538937472443.us-central1.run.app |
| Image | `us-central1-docker.pkg.dev/raidschedule/raidschedule/landingpage:<commit sha>` |
| Deploy identity | `landingpage-deployer`, via GitHub Workload Identity Federation (no stored keys) |

The project is shared with the RaidSchedule app (`raid.zerpy.dev`), which is a separate Cloud Run service with its own deploy pipeline.

## Making common edits

| To change | Edit |
| --- | --- |
| Project cards and their links | `src/data/projects.ts` — `href` is where the card goes, `github` adds the GitHub mark; leave either out to remove it |
| Headline and message | `DEFAULT_HEADLINE` / `DEFAULT_MESSAGE` in `src/components/hero/config.ts` |
| Animation timing, card order, sizes, particle counts | `src/components/hero/config.ts` |
| Page title | `index.html` |
| Caching and the `www` redirect | `nginx.conf` |

## Project layout

```
src/
  App.tsx                      page shell: ground, starfield, hero, projects
  components/hero/             the animated hero
    ConstructionHero.tsx       layout, headline, progress bar, reduced-motion switch
    AssemblyRow.tsx            placeholders, chevrons, cards, particles
    UICard.tsx                 the six card types
    rowState.ts                pure timing math; everything on screen is a function of time
    config.ts                  every tunable
    useAnimationClock.ts       the single animation clock (pauses off-screen and in hidden tabs)
    useRowLayout.ts            responsive card sizes and position count
  components/ProjectsSection.tsx
  components/zerpy/            Zerpy design-system components (Panel, SectionHeading)
  data/projects.ts             the project cards
  styles/zerpy/                Zerpy design tokens (--zp-* custom properties)
Dockerfile, nginx.conf         the production container
.github/workflows/deploy.yml   test, build and deploy on push to main
deploy/cloudrun/README.md      GCP setup runbook
design_handoff_zerpy_landing/  the original design spec and prototype (reference only)
```

Styling uses the Zerpy tokens throughout; the hero's animation honours `prefers-reduced-motion` by rendering a static row.
