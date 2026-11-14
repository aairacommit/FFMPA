# FFMPA

Real news made for kids aged 5 to 15. https://ffmpa.com

- `src/` the app and home page source. `cd src && python3 build.py` builds `src/index.html` (the app).
- `sitebuild/build_site.py` builds the deployable site into `site/` (home page, `/app/`, legal pages, sitemap, robots, llms.txt).
- `editions/` one JSON file per edition. The live app loads `editions/latest.json` from the `main` branch.
- `pipeline/` how the daily edition is written, checked and approved.

## How an edition goes live
1. A scheduled task drafts the morning edition and opens a pull request.
2. Newsroom agents fact check and review the draft (pipeline/NEWSROOM.md). Only a PASS from the independent reviewer is merged, and merging publishes it.

The owner can roll back any edition by reverting it on GitHub.
