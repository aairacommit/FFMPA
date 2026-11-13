# Daily editions: what the scheduled tasks do

There are two editions a day: **morning (`am`)**, drafted at 4:10 am IST, and **evening (`pm`)**, drafted at 5:10 pm IST. The steps below describe the morning edition. The evening edition follows the same steps with the differences listed in "Evening edition" at the end.

You are drafting today's FFMPA edition for children aged 5 to 15. **Approval is automatic once an independent reviewer agent passes it** (the owner decided this on 14 Nov 2026). The owner can still read any edition and roll it back. So the edition must be right before it is merged: nobody else checks it.

Families see editions on their own local schedule: the app shows the newest merged edition at 6:00 am and 7:00 pm in each family's time zone (an edition merged late appears as soon as it is merged), and alerts follow the same times. That is handled by the app and the Cloud Run newsroom; you only need to merge on time.

Read `pipeline/EDITORIAL.md` and `pipeline/SCHEMA.md` first, and open the newest file in `editions/` as your template.

## Steps
1. **Date.** Work out today's date in India (Asia/Kolkata). The edition `date` is that day. Call it D. If `editions/D-am.json` already exists on `main` or in an open pull request, stop: the edition is done.
2. **Branch.** `git checkout -b edition/D-am` from an up to date `main`.
3. **Find the news.** Search the web for what happened in the last 72 hours. Cover India (national news a child would care about, science, sport, culture, environment) and the world (science, space, nature, technology, business, sport, culture, world affairs). Collect about 25 candidates, then keep 12 to 15. Prefer stories that explain something, show people solving a problem, or connect to a child's life. Skip crime, celebrity gossip and anything you cannot source twice.
4. **Verify.** For each kept story open at least two reputable sources and read them. Every number, date, name and quote in your text must be in those sources. Record the publisher, date and URL for `src`.
5. **Write** each story at the Explorers and Thinkers levels, with glossary links, a think question, a quiz question, the Navigators `deep` layer, and a key number where there is a clear one. Follow the rules and word counts in EDITORIAL.md.
6. **Extras for the day.**
   - `today`: one to three verified days to know or birthdays for this date (use `where:["IN"]` for India-only items).
   - `learn`: one history, geography or science idea, tied to a story in this edition where possible.
   - `backThen`: one verified event on this calendar date in an earlier year, with why it still matters.
   - `hiddenWords`: one or two glossary words used in this edition, with a verified word origin.
   - `sketches` and `sketchFor`: at most one new sketch, only if a story has a concept a simple, correct drawing makes clearer. Existing sketches `smog`, `meteor`, `orbit`, `greenhouse` can be attached with `sketchFor` when they truly fit.
   - `bigStory`: on Monday choose the week's Big Story and plan five parts. Tuesday to Friday copy the previous edition's `bigStory` and replace today's locked part with real text (`o` and `x`) based on what actually happened.
   - On Monday also add `puzzles` (grids from `python3 pipeline/make_sudoku.py <Monday date>`, plus five news words with clues at each level) and `reporters` (one Young reporters assignment, `sample` empty).
   - Tuesday to Sunday: copy `puzzles`, `reporters` and `bigStory` forward from the previous edition so they are never missing.
7. **Check.** Save as `editions/D-am.json`. Run `python3 pipeline/validate.py editions/D-am.json` and fix until there are no errors. Read every warning and fix it or be ready to explain it.
8. **Second read.** Read the finished edition once more as a sceptical editor and as a worried parent. For each story ask: is every fact in the sources, is anything frightening, is it fair to all sides, would a seven-year-old understand the Explorers text? Fix or drop anything that fails. Dropping a story is better than keeping a doubtful one, as long as at least 10 remain.
9. **Open the pull request.** Copy the file to `editions/latest.json`. Commit both files with the message `Edition D morning`. Push the branch and open a pull request to `main` titled `Edition D morning: N stories`. The body must contain, in this order:
   - A two-line summary of the edition.
   - "Needs your eye": any judgement call, sensitive story or unexplained warning. Write "Nothing" if there is none.
   - A table of headline (Thinkers), topic, scope and the two source links.
   - The last line of the validator output.
10. **Independent review (required).** Start a separate reviewer agent with the Agent tool (a fresh agent, not a fork of yourself, so it has not seen your reasoning). Give it this brief: "Review the draft FFMPA edition at <absolute path to editions/D-am.json> in the repository clone at <path>. Follow pipeline/REVIEW.md exactly and reply in its format." Wait for its answer.
    - `PASS`: go to step 11.
    - `FIX`: make every listed change (or drop the story), run the validator again, commit and push to the same branch, then start a **new** reviewer agent with the same brief. At most three review rounds.
    - `REJECT`, or no `PASS` after three rounds, or you cannot start a reviewer agent at all: do not merge. Comment on the pull request with the reviewer's findings, leave it open for the owner, and say so in your final message. The previous edition stays live, which is fine.
11. **Merge.** Paste the reviewer's final answer as a comment on the pull request, then squash merge it into `main` (for example `gh pr merge <number> --squash --delete-branch`, or the GitHub API). Confirm `editions/latest.json` on `main` now has date D and edition `am`.
12. **Stop.** Change nothing outside `editions/`. Never push to `main` directly except through the merge in step 11.

## Rolling back an edition
The owner may say "roll back" (or revert the pull request on GitHub himself). To roll back: on an up to date `main`, `git revert --no-edit <merge commit of that edition>` and push to `main`. That restores the previous `editions/latest.json` and removes the edition file. Families see the previous edition within about ten minutes and no new alert is sent for it.

## If something goes wrong
- Fewer than 10 stories pass verification: continue with what you have only if there are at least 10; otherwise open an issue titled `Edition D: could not complete` explaining why, and stop.
- The push is refused: say so in your final message so the notification reaches the owner.


## Evening edition (`pm`)
Same steps and rules as the morning edition, with these differences:
- File `editions/D-pm.json`, branch `edition/D-pm`, commit and pull request title `Edition D evening`.
- 6 to 10 stories: at least 2 India and 3 world. Only news that broke or meaningfully moved **since this morning's edition** (read `editions/D-am.json` if it exists, and the open morning pull request if it was not merged). Never repeat a morning story unless there is real new information; if you update one, keep its id.
- Copy `today`, `learn`, `backThen`, `hiddenWords`, `puzzles`, `reporters` and `bigStory` from the morning edition unchanged, so the evening file is complete on its own. If no morning file exists, write them fresh.
- Add `"edition":"pm"`. The validator applies the smaller evening limits automatically.
- If fewer than 6 stories pass verification, do not open a pull request. Say so in the final message; the morning edition stays live, which is fine.
- The independent review and merge (steps 10 and 11) apply exactly as for the morning edition.
