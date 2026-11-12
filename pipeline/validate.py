#!/usr/bin/env python3
"""Checks an FFMPA edition file. Usage: python3 pipeline/validate.py editions/2026-11-12-am.json
Exit code 0 means no errors. Warnings should be read and either fixed or explained in the pull request."""
import json, re, sys, datetime
CATS="space science planet sports civics world culture history nature tech business".split()
TYPES="people places civics science tech words".split()
BANNED="kill killed blood gore horror terrifying shocking massacre suicide sexy drunk stupid idiot hate".split()
COUNTRIES="IN US UK AU KR DE FR".split()
errs=[]; warns=[]
def E(m): errs.append(m)
def W(m): warns.append(m)
def words(t): return len(re.findall(r"[\w'’]+", t))
def strip(t): return re.sub(r"\[\[[^|\]]*\|([^\]]*)\]\]", r"\1", t)
def main(path):
    try: ed=json.load(open(path,encoding="utf-8"))
    except Exception as ex: print("ERROR not valid JSON:",ex); return 1
    if ed.get("schema")!=1: E("schema must be 1")
    try: day=datetime.date.fromisoformat(ed.get("date",""))
    except Exception: E("date must be YYYY-MM-DD"); day=None
    for f in "stories glossary deep today learn hiddenWords backThen".split():
        if f not in ed: E(f"missing field: {f}")
    st=ed.get("stories",[]); G=ed.get("glossary",{}); ids=set()
    pm=ed.get("edition")=="pm"
    if ed.get("edition") not in ("am","pm"): E("edition must be am or pm")
    lo_n,hi_n=(6,12) if pm else (10,20)
    if not lo_n<=len(st)<=hi_n: E(f"{len(st)} stories; need {lo_n} to {hi_n}")
    if day and day.weekday()==0 and not pm:
        for f in ("puzzles","reporters","bigStory"):
            if f not in ed: E(f"Monday edition needs {f}")
    for k,g in G.items():
        if not (isinstance(g,list) and len(g)==4 and all(isinstance(x,str) and x for x in g)): E(f"glossary {k}: need [label,type,explorers,thinkers]")
        elif g[1] not in TYPES: E(f"glossary {k}: type {g[1]} not in {TYPES}")
    used=set()
    for s in st:
        i=s.get("id","?")
        if not re.fullmatch(r"(in|us|uk|au|kr|de|fr|g)-[a-z0-9-]{2,30}",i): E(f"{i}: id must look like in-slug or g-slug")
        if i in ids: E(f"{i}: duplicate id")
        ids.add(i)
        if s.get("scope") not in COUNTRIES+["global"]: E(f"{i}: bad scope")
        if s.get("cat") not in CATS: E(f"{i}: bad cat")
        if s.get("kind") not in ("news","calendar"): E(f"{i}: kind must be news or calendar")
        try:
            d=datetime.date.fromisoformat(s.get("date",""))
            if day and s.get("kind")=="news" and not 0<=(day-d).days<=3: E(f"{i}: story date {d} is not within 3 days before {day}")
        except Exception: E(f"{i}: bad date")
        for lv,lo,hi,maxp in (("x",30,80,4),("o",80,170,4)):
            v=s.get(lv) or {}
            if not v.get("t") or not isinstance(v.get("b"),list) or not v["b"]: E(f"{i}.{lv}: needs t and b"); continue
            if len(v["t"])>75: E(f"{i}.{lv}: headline longer than 75 characters")
            if len(v["b"])>maxp: E(f"{i}.{lv}: too many paragraphs")
            body=strip(" ".join(v["b"])); n=words(body)
            if not lo<=n<=hi: (E if (n<lo*0.7 or n>hi*1.25) else W)(f"{i}.{lv}: {n} words, target {lo} to {hi}")
            if lv=="x":
                for sent in re.split(r"(?<=[.!?])\s+",body):
                    if words(sent)>20: W(f"{i}.x: long sentence for Explorers ({words(sent)} words): {sent[:60]}")
            txt=(v["t"]+" "+body).lower()
            for b in BANNED:
                if re.search(rf"\b{b}\b",txt): E(f"{i}.{lv}: banned word '{b}'")
            if "—" in v["t"]+body or "–" in v["t"]+body: E(f"{i}.{lv}: contains a dash character; use commas or 'to'")
            if re.search(r"https?://|www\.",body): E(f"{i}.{lv}: link in story text")
            for k in re.findall(r"\[\[([^|\]]*)\|",(" ".join(v["b"]))):
                used.add(k)
                if k not in G: E(f"{i}.{lv}: glossary key '{k}' is not defined")
        src=s.get("src",[])
        need=2 if s.get("kind")=="news" else 1
        if len(src)<need: E(f"{i}: needs at least {need} sources")
        doms=set()
        for x in src:
            if not (isinstance(x,list) and len(x)==2 and str(x[1]).startswith("http")): E(f"{i}: each source is [label, url]")
            else: doms.add(re.sub(r"^https?://(www\.)?","",x[1]).split("/")[0])
        if s.get("kind")=="news" and len(doms)<2: E(f"{i}: sources must come from two different sites")
        q=s.get("quiz") or {}
        if not (q.get("q") and isinstance(q.get("a"),list) and len(q["a"])==4 and isinstance(q.get("c"),int) and 0<=q["c"]<4 and len(set(q["a"]))==4): E(f"{i}: quiz needs q, four different options and c")
        if not s.get("think"): E(f"{i}: missing think question")
        d=ed.get("deep",{}).get(i)
        if not (d and d.get("ctx") and d.get("ask") and isinstance(d.get("jobs"),list) and len(d["jobs"])==3): E(f"{i}: deep needs ctx, ask and three jobs")
        elif not d["ask"].strip().endswith("?"): W(f"{i}: deep.ask should be a question")
        if s.get("sensitive") and not s.get("olderOnly"): E(f"{i}: sensitive stories must set olderOnly")
        if s.get("cat")=="world" and not s.get("sensitive") and re.search(r"\b(war|troops|missile|invasion|attack)\b",strip(" ".join((s.get('o') or {}).get('b',[]))).lower()): W(f"{i}: looks like a conflict story; set sensitive and olderOnly?")
    cats={s.get("cat") for s in st}
    need_c,need_in,need_g=(4,2,3) if pm else (5,3,6)
    if len(cats)<need_c: E(f"only {len(cats)} topic categories; need {need_c} or more")
    if sum(1 for s in st if s.get("scope")=="IN")<need_in: E(f"need at least {need_in} India stories")
    if sum(1 for s in st if s.get("scope")=="global")<need_g: E(f"need at least {need_g} world stories")
    for k in ("keys","xkeys","sketchFor"):
        for i in ed.get(k,{}):
            if i not in ids and not i.startswith("learn:"): E(f"{k}: unknown story id {i}")
    for i,key in ed.get("sketchFor",{}).items():
        if key not in ed.get("sketches",{}) and key not in ("smog","meteor","orbit","greenhouse"): E(f"sketchFor {i}: sketch '{key}' not defined")
    for key,sk in ed.get("sketches",{}).items():
        if len(sk.get("steps",[]))!=3: E(f"sketch {key}: needs exactly 3 steps")
        for n,stp in enumerate(sk.get("steps",[])):
            if not stp.get("o") or not stp.get("x"): E(f"sketch {key} step {n+1}: needs o and x text")
            for sh in stp.get("d",[]):
                kind=[k for k in sh if k in "lrcpat"]
                if len(kind)!=1: E(f"sketch {key}: bad shape {sh}"); continue
                v=sh[kind[0]]
                if kind[0]!="p":
                    nums=[x for x in v if isinstance(x,(int,float))]
                    if kind[0] in "la" and len(nums)!=4 or kind[0]=="r" and len(nums)!=4 or kind[0]=="c" and len(nums)!=3 or kind[0]=="t" and (len(nums)!=2 or len(v)!=3): E(f"sketch {key}: wrong numbers in {sh}")
                    if kind[0] in "lat" and nums and (min(nums[0::2])<0 or max(nums[0::2])>320 or min(nums[1::2])<0 or max(nums[1::2])>220): E(f"sketch {key}: shape outside the 320 x 220 board {sh}")
    L=ed.get("learn") or {}
    for lv in ("x","o"):
        v=L.get(lv) or {}
        if not (v.get("t") and v.get("b") and v.get("remember") and v.get("q") and isinstance(v.get("a"),list) and len(v["a"])>=2 and isinstance(v.get("c"),int) and v["c"]<len(v["a"])): E(f"learn.{lv}: needs t, b, remember, q, a, c")
    T=ed.get("today") or {}
    if not (T.get("days") or T.get("born")): E("today: needs at least one day or birthday")
    hw=ed.get("hiddenWords") or []
    if not any(h.get("k") in used and h.get("o") for h in hw): E("hiddenWords: at least one key must be linked in a story and have an origin")
    bt=ed.get("backThen") or {}
    if not all(bt.get(k) for k in ("y","t","o","x","why")): E("backThen: needs y, t, o, x, why")
    unused=[k for k in G if k not in used and k not in (ed.get("bigStory") or {}).get("words",[])]
    if len(unused)>40: pass
    for m in errs: print("ERROR  ",m)
    for m in warns: print("warning",m)
    print(f"\n{len(st)} stories, {len(cats)} categories, {len(errs)} errors, {len(warns)} warnings")
    return 1 if errs else 0
if __name__=="__main__": sys.exit(main(sys.argv[1]))
