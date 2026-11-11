# Edition file format (schema 1)

One JSON object. The best reference is the most recent file in `editions/`: copy its shape exactly. `python3 pipeline/validate.py <file>` checks it.

| Field | Required | Notes |
|---|---|---|
| `schema` | yes | `1` |
| `date` | yes | `YYYY-MM-DD`, the edition day in India |
| `edition` | yes | `"am"` |
| `countries` | yes | country codes with local stories, for now `["IN"]` |
| `stories` | yes | array, see below |
| `glossary` | yes | `{key: [label, type, explorersText, thinkersText]}`; type is one of `people, places, civics, science, tech, words` |
| `deep` | yes | `{storyId: {ctx, ask, jobs:[3 strings]}}` for every story |
| `keys` | no | `{storyId: {type:"number", v, l}}` one key number per story where there is a clear one |
| `xkeys` | no | `{storyId: {type:"check", q, a:[2 options], c, right, wrong}}` quick check for Explorers |
| `today` | yes | `{days:[{name, what, where?:[codes]}], born:[{name, year, what, where?}], week?}` verified facts about this date |
| `learn` | yes | `{t, cat, link, x:{t,b:[..],remember,q,a:[3],c}, o:{...same}}` one history, geography or science idea, ideally tied to a story |
| `sketches` | no | `{key: {t, c, steps:[3 x {o, x, d:[shapes]}]}}` see below |
| `sketchFor` | no | `{storyId: sketchKey}`; use `"learn:<date>"` as the id for the Learn card |
| `hiddenWords` | yes | `[{k: glossaryKey, o: verified word origin}]` at least one whose key is linked in a story |
| `backThen` | yes | `{y, t, o, x, why}` something verified that happened on this calendar date |
| `bigStory` | Mondays, then update daily | `{week:"<Monday date>", story, cat, sketch?, t, sub, x:{why}, o:{why}, facts:[[v,l] x4], days:[5 x {d,h,o,x} or {d,h,lock}], words:[glossary keys], poll:{q,a:[[label,explanation] x4]}, talk}` |
| `puzzles` | Mondays | `{week, sudoku:{x:{n:4,br:2,bc:2,p,s}, o:{n:6,br:2,bc:3,p,s}, n:{n:9,br:3,bc:3,p,s}}, words:{x:[[WORD,clue]..], o:[..]}}` make sudoku grids with `pipeline/make_sudoku.py` |
| `reporters` | Mondays | `{week, t, why, tips:[3], sample:[]}` the Young reporters assignment; leave `sample` empty |

## Story
```
{ "id":"in-short-slug" or "g-short-slug", "scope":"IN" or "global", "cat": one of space science planet sports civics world culture history nature tech business,
  "emoji":"one emoji", "date":"YYYY-MM-DD (when it happened or was reported)", "kind":"news" or "calendar", "when":"only for calendar",
  "x":{"t":"headline","b":["para","para"]}, "o":{"t":"headline","b":["para","para","para"]},
  "local":{"IN":"optional one sentence"}, "think":"...", "quiz":{"q":"...","a":["","","",""],"c":0},
  "src":[["Publisher, 12 Nov","https://..."],["Second publisher, 12 Nov","https://..."]],
  "olderOnly":true (optional), "sensitive":"conflict" or "politics" (optional) }
```

## Sketch shapes
Board is 320 wide by 220 tall. Each step adds shapes to the drawing: `{"l":[x1,y1,x2,y2]}` line, `{"r":[x,y,w,h]}` box, `{"c":[cx,cy,r]}` circle, `{"p":"SVG path"}`, `{"a":[x1,y1,x2,y2]}` arrow, `{"t":[x,y,"label"]}`. Add `"acc":1` to draw in the topic colour. Keep labels short and inside the board. Only add a sketch when a story has a concept that a simple drawing makes clearer, and make sure the drawing is scientifically right.
