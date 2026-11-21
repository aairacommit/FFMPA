# Daily editions: what the scheduled tasks do

There are two editions a day: **morning (`am`)**, drafted at 4:10 am IST, and **evening (`pm`)**, drafted at 5:10 pm IST. The steps below describe the morning edition. The evening edition follows the same steps with the differences listed in "Evening edition" at the end.

You are drafting today's FFMPA edition for children aged 5 to 15. **Approval is automatic once an independent reviewer agent passes it** (the owner decided this on 14 Nov 2026). The owner can still read any edition and roll it back. So the edition must be right before it is merged: nobody else checks it.

Families see editions on their own local schedule: each edition is due at 6:00 am (morning) or 7:00 pm (evening) on its date in each family's time zone; one merged a little late appears as soon as it is merged, and a later one at the family's next release, and alerts follow the same times. That is handled by the app and the Cloud Run newsroom; you only need to merge on time.

## The clock: never miss an edition
Children open the app at 6:00 am and 7:00 pm in India. An edition that is late or missing breaks their habit, so the deadline is as important as the quality bar. Times are IST; the evening edition uses the same steps 13 hours later (5:10 pm start, merged by 6:55 pm).

| By | Morning | Evening |
|---|---|---|
| Fact sheets back from reporters | 4:45 am | 5:45 pm |
| Lineup chosen | 4:55 am | 5:55 pm |
| Stories and extras written | 5:10 am | 6:10 pm |
| Fact check and standards edit done | 5:30 am | 6:30 pm |
| Pull request open | 5:35 am | 6:35 pm |
| Merged | 5:55 am | 6:55 pm |

- **Work in parallel waves.** Start every agent of a wave in one message (all reporters together, all writers together, all fact checkers together). Check the time (`TZ=Asia/Kolkata date +%H:%M`) at the end of every wave.
- **Shrink, do not slip.** At the pull request deadline, stop adding: drop any story whose fact check or standards edit is not finished. A tight edition of 8 strong stories is better than a late one of 14.
- **Fast review rounds after the deadline.** If a reviewer answers `FIX` after 6:00 am (7:00 pm), fix only what takes under 10 minutes and drop every other story it lists, then start the next reviewer. Minimums while the deadline rule applies: 8 morning stories, 4 evening stories. When an edition has fewer stories than the normal minimum (10 morning, 6 evening), add `"short":true` to the file so the validator accepts it.
- **Dropping a story cleanly.** Remove it from `stories`, `deep`, `keys`, `xkeys`, `sketchFor` and `bigStory.story` if it is there, and remove glossary entries and `hiddenWords` that no remaining story uses (keep at least one `hiddenWords` entry linked in a story). Then run the validator.
- **Record every review.** Before starting each reviewer, comment on the pull request: `Review started HH:MM IST on commit <sha>`. Paste each reviewer's full answer as a comment when it arrives, with the same commit SHA.
- **Short edition, never an empty slot.** If there is still no `PASS` at 6:45 am (7:45 pm), take the **latest** review's "Clean stories" list (only stories it listed, and only if they have not been edited since that review's commit), keep those stories and the extras it did not list as problems (at least 5 morning, 3 evening), drop the rest cleanly as above, add `"short":true`, run the validator, push, and start a fresh reviewer with this brief: "This is a short edition under the deadline rule in pipeline/DAILY.md. The previous review ran on commit <sha> (its answer is in the pull request comments). Run `git diff <sha> -- <file>`: check that the only changes are dropped stories and their clean up (deep, keys, xkeys, sketchFor, unused glossary and hiddenWords entries) and the short flag, that every remaining story is in that review's Clean stories list, and that the validator passes; then answer PASS or FIX in the REVIEW.md format." Merge on `PASS` and add "Short edition (deadline rule)" to the pull request title. Only if even that is impossible, leave the pull request open and say why.
- **A watchdog** (the scheduled task "FFMPA edition watchdog", 6:35 am and 7:35 pm IST) takes over a run that has stopped. It treats a pull request as stopped only when it has had no commit and no comment for 30 minutes and no "Review started" comment in the last 40 minutes. Before taking over it comments `WATCHDOG TAKEOVER HH:MM IST` on the pull request. **Before every push and before merging, read the pull request comments: if there is a `WATCHDOG TAKEOVER` comment that is not yours, stop at once, change nothing more, and say so in your final message.** Never force push.

Read `pipeline/NEWSROOM.md`, `pipeline/EDITORIAL.md`, `pipeline/SCHEMA.md` and `pipeline/REVIEW.md` first, and open the newest file in `editions/` as your template. You are the managing editor: the research, story choice, writing, fact check and standards edit are done by the newsroom agents described in NEWSROOM.md, which you start with the Agent tool.

## Steps
1. **Date.** Work out today's date in India (Asia/Kolkata). The edition `date` is that day. Call it D. If `editions/D-am.json` already exists on `main` or in an open pull request, stop: the edition is done.
2. **Branch.** `git checkout -b edition/D-am` from an up to date `main`.
3. **Find the news.** Start the beat reporters (NEWSROOM.md desk 1) in parallel. They return candidates from the last 72 hours with fact sheets in which every fact is tagged with two independent reputable sources and the date the story was first reported.
4. **Choose the lineup.** Give all candidates and the previous three editions to the analyst (desk 2). It picks 12 to 15 stories (3 to 5 India), balances the mix, checks major outlets for any big story that is missing, and gives each story its angle for children. Send any missing big story back to a beat reporter for a fact sheet.
5. **Write.** Writers (desk 3) write each story at the Explorers and Thinkers levels, with glossary links, a think question, a quiz question, the Navigators `deep` layer, a key number where there is a clear one, and `src`, using only facts in the fact sheets. Follow the rules and word counts in EDITORIAL.md.
6. **Extras for the day.**
   - `today`: one to three verified days to know or birthdays for this date (use `where:["IN"]` for India-only items).
   - `learn`: one history, geography or science idea, tied to a story in this edition where possible.
   - `backThen`: one verified event on this calendar date in an earlier year, with why it still matters.
   - `hiddenWords`: one or two glossary words used in this edition, with a verified word origin.
   - `sketches` and `sketchFor`: at most one new sketch, only if a story has a concept a simple, correct drawing makes clearer. Existing sketches `smog`, `meteor`, `orbit`, `greenhouse` can be attached with `sketchFor` when they truly fit.
   - `bigStory`: on Monday choose the week's Big Story and plan five parts. Tuesday to Friday copy the previous edition's `bigStory` and replace today's locked part with real text (`o` and `x`) based on what actually happened. Every day, including Saturday and Sunday, check that nothing in the Big Story has been overtaken by newer news (for example a mission that has since lost contact); if it has, add one sentence to the latest part saying what changed, with its source.
   - On Monday also add `puzzles` (grids from `python3 pipeline/make_sudoku.py <Monday date>`, plus five news words with clues at each level) and `reporters` (one Young reporters assignment, `sample` empty).
   - Tuesday to Sunday: copy `puzzles`, `reporters` and `bigStory` forward from the previous edition so they are never missing.
7. **Check.** Save as `editions/D-am.json`. Run `python3 pipeline/validate.py editions/D-am.json` and fix until there are no errors. Read every warning and fix it or be ready to explain it.
8. **Fact check, then standards edit.** Send the file to the fact checker (desk 4) and fix or drop every claim it does not mark supported. Then send it to the standards editor (desk 5) for language, safety, fairness, reading level and usefulness, and make every change it lists for anything scored below 4. Run the validator again after each round. Dropping a story is better than keeping a doubtful one, as long as at least 10 remain (8 once the deadline rule applies).
9. **Open the pull request.** Copy the file to `editions/latest.json`. Commit both files with the message `Edition D morning`. Push the branch and open a pull request to `main` titled `Edition D morning: N stories`. The body must contain, in this order:
   - A two-line summary of the edition.
   - "Needs your eye": any judgement call, sensitive story or unexplained warning. Write "Nothing" if there is none.
   - A table of headline (Thinkers), topic, scope and the two source links.
   - A "Newsroom" section: beats covered, the analyst's missing story check, the number of fact checker findings and standards changes.
   - The last line of the validator output.
10. **Independent review (required).** Start a separate reviewer agent with the Agent tool (a fresh agent, not a fork of yourself, so it has not seen your reasoning). Give it this brief: "Review the draft FFMPA edition at <absolute path to editions/D-am.json> in the repository clone at <path>. Follow pipeline/REVIEW.md exactly and reply in its format." Wait for its answer.
    - `PASS`: go to step 11.
    - `FIX`: make every listed change (or drop the story), run the validator again, commit and push to the same branch, then start a **new** reviewer agent with the same brief. Repeat until a reviewer answers `PASS`. There is no limit on the number of review rounds (the owner removed the three-round cap on 14 Nov 2026).
    - `REJECT`, or you cannot start a reviewer agent at all: do not merge. Comment on the pull request with the reviewer's findings, leave it open for the owner, and say so in your final message. The previous edition stays live, which is fine.
11. **Merge.** Paste the reviewer's final answer as a comment on the pull request, then squash merge it into `main` with the REST API (GraphQL, and so `gh pr merge` and `gh pr create`, are blocked in these sessions): `gh api -X PUT repos/aairacommit/FFMPA/pulls/<number>/merge -f merge_method=squash`, then try `gh api -X DELETE repos/aairacommit/FFMPA/git/refs/heads/<branch>` (if the proxy refuses it, leave the branch; that is fine). Open the pull request the same way: `gh api repos/aairacommit/FFMPA/pulls -f title=... -f head=<branch> -f base=main -f body=...`; comment with `gh api repos/aairacommit/FFMPA/issues/<number>/comments -f body=...`. Confirm `editions/latest.json` on `main` now has date D and edition `am`.
12. **Stop.** Change nothing outside `editions/`. Never push to `main` directly except through the merge in step 11.

## Rolling back an edition
The owner may say "roll back" (or revert the pull request on GitHub himself). To roll back: on an up to date `main`, `git revert --no-edit <merge commit of that edition>` and push to `main`. That restores the previous `editions/latest.json` and removes the edition file. Families see the previous edition within about ten minutes and no new alert is sent for it.

## If something goes wrong
- Fewer than 10 stories pass verification: continue with 8 or more; with fewer, use the short edition rule in "The clock" (at least 5 clean stories). Only if that is impossible, open an issue titled `Edition D: could not complete` explaining why, and stop.
- An open edition pull request from an earlier date (for example a stuck evening edition) is stale once the next edition is merged: close it with a one-line comment (`gh api -X PATCH repos/aairacommit/FFMPA/pulls/<number> -f state=closed`). Its stories can be carried into today's edition through the newsroom as usual.
- The push is refused: say so in your final message so the notification reaches the owner.


## Evening edition (`pm`)
Same steps and rules as the morning edition, with these differences:
- File `editions/D-pm.json`, branch `edition/D-pm`, commit and pull request title `Edition D evening`.
- 6 to 10 stories: at least 2 India and 3 world. Only news that broke or meaningfully moved **since this morning's edition** (read `editions/D-am.json` if it exists, and the open morning pull request if it was not merged). Never repeat a morning story unless there is real new information; if you update one, keep its id.
- Copy `today`, `learn`, `backThen`, `hiddenWords`, `puzzles`, `reporters` and `bigStory` from the morning edition unchanged, so the evening file is complete on its own. If no morning file exists, write them fresh.
- Add `"edition":"pm"`. The validator applies the smaller evening limits automatically.
- If fewer than 6 stories pass verification, use the short edition rule in "The clock" (at least 3 clean stories). Only if that is impossible, open no pull request and say so in the final message; the morning edition stays live.
- The newsroom (beat reporters for news since the morning edition, analyst, writers, fact checker, standards editor), the independent review and the merge apply exactly as for the morning edition. The calendar reporter is not needed when the morning extras are copied.
