# FFMPA editorial rules

These rules are public promises (see /safety/ on the site). An edition that breaks one must not be proposed.

## What we publish
- Real, recent news: every news story happened or was reported in the last 72 hours. Calendar explainers ("why Friday is World Kindness Day") are allowed and marked `kind:"calendar"`.
- Every fact in a story appears in at least two reputable sources (major wire services, national newspapers of record, public broadcasters, official bodies, scientific institutions). Each story lists its sources with working URLs.
- If two good sources disagree, say so or leave the fact out. If you cannot confirm it, leave it out. Never fill a gap from memory.
- Numbers, dates, names and titles are copied from the sources and checked twice.

## What we never publish
- Graphic detail of violence, injury, illness, crime or death. No casualty counts for Explorers.
- Suicide and self-harm, sexual violence or abuse, details of terror attacks, crime told for shock, celebrity gossip, gambling.
- Fear words and sensational headlines. Banned words (the validator enforces these): kill, killed, blood, gore, horror, terrifying, shocking, massacre, suicide, sexy, drunk, stupid, idiot, hate.
- Opinions about politics or religion. Explain how things work and what happened. Give more than one view on contested questions. Never tell children what to think.
- Names or photos of children involved in news events, victims or suspects.
- Links to other websites inside story text. Sources are plain text labels plus a URL in `src` only.
- Em dashes. Use commas, colons or full stops.

## Sensitive stories
- War, conflict and politics: Thinkers and Navigators only. Set `olderOnly:true` and `sensitive:"conflict"` or `"politics"`. Calm, factual, focused on what is being done.
- Disasters: lead with helpers and safety. No frightening images in words.
- Aim for balance across the edition: at least one hopeful story, one science or nature story, and no more than two heavy stories.

## The three levels
- Explorers (5 to 9), field `x`: 2 or 3 short paragraphs, 35 to 70 words in total. Everyday words, sentences of 15 words or fewer, one idea per sentence. Explain or avoid hard words.
- Thinkers (10 to 12), field `o`: 3 paragraphs, 90 to 150 words. Real terms, each explained the first time. Who, what, where, when, why.
- Navigators (13 to 15) read the Thinkers text plus `deep`: `ctx` (the bigger picture, 2 or 3 sentences of verified background), `ask` (one genuinely arguable question, fair to more than one side), `jobs` (three real careers connected to the story).
- Headlines: under 70 characters, plain and accurate, no clickbait.

## Every story also needs
- `think`: one open question a child can discuss at home.
- `quiz`: one question answerable from the story, four options, exactly one right.
- Glossary links: mark 2 to 5 people, places or ideas as `[[key|shown text]]` and define every key in `glossary`.
- `local` (optional): one sentence on why a world story matters in a given country.

## Mix for one morning edition (launch scope: India plus world)
- 12 to 15 stories: 3 to 5 with `scope:"IN"`, the rest `scope:"global"`.
- At least 5 different topic categories. Include science, space or nature; sport or culture; and at least one technology or business story.
- Do not repeat a story that already ran in the previous three editions unless there is real new information.
