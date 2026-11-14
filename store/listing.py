TITLE="FFMPA: Daily News for Kids"
SHORT="Real news for kids aged 5 to 15. Calm daily stories, fact checked every edition."
FULL="""Real news, made for kids.

FFMPA gives children aged 5 to 15 a short, calm edition of real news every morning and evening. Every story is written for their reading level and fact checked and reviewed before it goes out. No endless feed: the edition ends, and so does screen time.

WHY FAMILIES CHOOSE FFMPA
• Three reading levels: Explorers (5 to 9), Thinkers (10 to 12) and Navigators (13 to 15)
• Local news for your country plus world news, science, space, nature, sport and technology
• Two editions a day, with only the last 3 days of news
• Tap any highlighted word for a quick explainer and save it to a word bank
• An optional alert when each new edition is ready

NEWS THAT EXPLAINS ITSELF
• Hand-drawn sketch explainers make hard ideas clear in three steps
• One Big Story followed through the whole week
• Learn one thing a day from history, geography or science
• A daily quiz, weekly puzzles and a craft every Sunday
• Streaks, levels and hidden finds that reward curiosity, not screen time

BUILT FOR SAFETY
• No ads
• Nothing in the app links to other websites
• No chat, no comments, no strangers
• Young reporters can send a news report, and an editor reads every one first. The front page shows age group and country only, never a name
• War and conflict stories never appear at the youngest level
• A feelings check after every story

PARENTS STAY IN CONTROL
• Sign in with your email and a one-time code. No password to remember
• A PIN protects reading level, topics, sensitive news, sharing and daily limits
• Progress follows your family to any device
• Download or delete your data at any time from parent settings

FOR SCHOOLS
• Classroom mode: a weekly quiz for the big screen and a printable worksheet. Pupils join with a class code and no names. Teachers see class totals only

Free during early access. Made in Bangalore by Founderfreedom Ventures LLP.
Privacy policy: https://ffmpa.com/privacy/"""
print(len(TITLE),len(SHORT),len(FULL))
import json; json.dump({"title":TITLE,"short":SHORT,"full":FULL},open("/home/claude/store/listing.json","w"))
