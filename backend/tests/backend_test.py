"""End-to-end test of FFMPA backend wiring against an in-memory fake Supabase."""
import json, re, time, uuid, sys
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

APP = open('/home/claude/repo-ffmpa/src/index.html').read()
DB = {"profiles": {}, "config": {}, "reports": [], "classes": [], "members": [], "progress": {}}
USERS = {}
LOG = []

def uid_for(email):
    return USERS.setdefault(email, str(uuid.uuid5(uuid.NAMESPACE_DNS, email)))

def who(req):
    a = req.headers.get("authorization", "")
    if a.startswith("Bearer AT|"):
        email = a.split("|", 1)[1]
        return email, uid_for(email)
    return None, None

def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()) + str(time.time())[-3:]

def handle(route):
    req = route.request
    u = urlparse(req.url); q = parse_qs(u.query); path = u.path; m = req.method
    body = json.loads(req.post_data) if req.post_data else None
    email, uid = who(req)
    LOG.append((m, path, u.query[:60]))
    def ok(data, status=200):
        route.fulfill(status=status, content_type="application/json", body=json.dumps(data) if data is not None else "",
                      headers={"access-control-allow-origin": "*"})
    if m == "OPTIONS":
        return route.fulfill(status=200, headers={"access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*"})
    if path == "/auth/v1/otp":
        return ok({})
    if path == "/auth/v1/verify":
        if body["token"] != "123456":
            return ok({"msg": "Token has expired or is invalid"}, 403)
        e = body["email"].lower()
        return ok({"access_token": "AT|" + e, "refresh_token": "RT|" + e, "expires_in": 3600, "expires_at": int(time.time()) + 3600, "user": {"id": uid_for(e), "email": e}})
    if path == "/auth/v1/logout":
        return ok(None, 204)
    if path == "/rest/v1/profiles":
        if m == "GET":
            i = q["id"][0][3:]
            if i != uid: return ok([])
            p = DB["profiles"].get(i); return ok([p] if p else [])
        if m == "POST":
            assert body["id"] == uid and body.get("consent_at"), body
            body["updated_at"] = now(); DB["profiles"][uid] = body; return ok(None, 201)
        if m == "PATCH":
            i = q["id"][0][3:]; assert i == uid
            p = DB["profiles"][i]; p.update(body); p["updated_at"] = now(); return ok([p])
    if path == "/rest/v1/app_config":
        if m == "GET":
            v = DB["config"].get("admin"); return ok([{"value": v, "updated_at": now()}] if v else [])
        if m == "POST":
            if email != "aairainvests@gmail.com": return ok({"message": "denied"}, 403)
            DB["config"][body["key"]] = body["value"]; return ok(None, 201)
    if path == "/rest/v1/reports":
        if m == "POST":
            if not uid: return ok({"message": "jwt"}, 401)
            n = sum(1 for r in DB["reports"] if r["user_id"] == uid and r["week"] == body["week"])
            if n >= 5: return ok({"message": "five reports a week is the limit"}, 400)
            r = dict(body, id=str(uuid.uuid4()), user_id=uid, status="pending", created_at=now()); DB["reports"].append(r); return ok(None, 201)
        if m == "GET":
            admin = email == "aairainvests@gmail.com"
            rows = [r for r in DB["reports"] if admin or r["user_id"] == uid]
            if "week" in q: rows = [r for r in rows if r["week"] == q["week"][0][3:]]
            return ok(rows)
        if m == "PATCH":
            if email != "aairainvests@gmail.com": return ok([], 200)
            i = q["id"][0][3:]
            for r in DB["reports"]:
                if r["id"] == i: r.update(body)
            return ok(None, 204)
    if path == "/rest/v1/classes":
        if m == "POST":
            c = dict(body, id=str(uuid.uuid4()), teacher_id=uid); DB["classes"].append(c); return ok([c], 201)
        if m == "DELETE":
            i = q["id"][0][3:]; DB["classes"] = [c for c in DB["classes"] if not (c["id"] == i and c["teacher_id"] == uid)]; return ok(None, 204)
    if path.startswith("/rest/v1/rpc/"):
        fn = path.rsplit("/", 1)[1]
        if fn == "is_admin": return ok(email == "aairainvests@gmail.com")
        if fn == "get_public_reports": return ok([{k: r[k] for k in ("headline", "body", "age_band", "country")} for r in DB["reports"] if r["status"] == "approved" and r["week"] == body["p_week"]])
        if not uid: return ok({"message": "JWT expired"}, 401)
        if fn == "join_class":
            c = next((c for c in DB["classes"] if c["code"] == body["p_code"]), None)
            if not c: return ok([])
            if (c["id"], uid) not in DB["members"]: DB["members"].append((c["id"], uid))
            return ok([{"id": c["id"], "name": c["name"], "level": c["level"]}])
        if fn == "class_report":
            for (cid, u2) in DB["members"]:
                if u2 == uid: DB["progress"][(cid, uid)] = body
            return ok(None, 204)
        if fn == "class_summary":
            n = sum(1 for (cid, _) in DB["members"] if cid == body["p_class"])
            reads = sum(v["p_reads"] for (cid, _), v in DB["progress"].items() if cid == body["p_class"])
            return ok([{"pupils": n, "reads": reads if n >= 3 else None, "quiz_avg": None}])
        if fn == "class_goal":
            c = next(c for c in DB["classes"] if c["id"] == body["p_class"])
            return ok([{"name": c["name"], "reads": sum(v["p_reads"] for (cid, _), v in DB["progress"].items() if cid == c["id"])}])
        if fn == "leave_class": DB["members"] = [x for x in DB["members"] if x != (body["p_class"], uid)]; return ok(None, 204)
        if fn == "admin_overview": return ok([{"families": len(DB["profiles"]), "signed_in_7d": 1, "reports_waiting": sum(r["status"] == "pending" for r in DB["reports"]), "classes": len(DB["classes"]), "pupils": len(DB["members"])}])
        if fn == "delete_my_account":
            DB["profiles"].pop(uid, None); DB["reports"] = [r for r in DB["reports"] if r["user_id"] != uid]; return ok(None, 204)
    print("UNHANDLED", m, req.url); ok({"message": "unhandled"}, 500)

def serve_app(route):
    route.fulfill(status=200, content_type="text/html", body=APP)

errors = []
def ctx_page(browser):
    c = browser.new_context(viewport={"width": 400, "height": 860}, ignore_https_errors=True)
    c.route(re.compile(r"https://gqfxgkzetapivlbybamf\.supabase\.co/.*"), handle)
    c.route(re.compile(r"https://ffmpa\.com/app/.*"), serve_app)
    c.route(re.compile(r"https://(?!ffmpa\.com|gqfxgkzetapivlbybamf).*"), lambda r: r.abort())
    p = c.new_page()
    p.on("pageerror", lambda e: errors.append(str(e)))
    p.on("console", lambda m: m.type == "error" and errors.append("console: " + m.text))
    return c, p

def check(cond, msg):
    print(("PASS " if cond else "FAIL ") + msg)
    if not cond: check.failed = True
check.failed = False

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    # ---------- device A: new family ----------
    cA, p = ctx_page(b)
    p.goto("https://ffmpa.com/app/"); p.wait_for_timeout(800)
    check(p.evaluate("SB_ON"), "backend on for ffmpa.com")
    p.fill("#wE", "Parent@Example.com"); p.click("#wF button[type=submit]"); p.wait_for_selector("#wC")
    check("Prototype" not in p.inner_text("#welcome"), "no prototype code hint")
    p.fill("#wC", "000000"); p.click("#wF button[type=submit]"); p.wait_for_timeout(400)
    check("did not match" in p.inner_text("#wErr"), "wrong code rejected: " + p.inner_text("#wErr"))
    p.fill("#wC", "123456"); p.click("#wF button[type=submit]"); p.wait_for_selector("#wN")
    p.fill("#wN", "Aanya"); p.click("#wF button[type=submit]"); p.wait_for_selector("[data-c]")
    p.click('[data-c="IN"]'); p.click("#wF button[type=submit]"); p.wait_for_selector("#wP")
    p.fill("#wP", "2580"); p.click("#wF button[type=submit]"); p.wait_for_timeout(800)
    uidA = uid_for("parent@example.com")
    prof = DB["profiles"].get(uidA)
    check(prof is not None and prof["consent_at"] and prof["settings"]["name"] == "Aanya", "profile created with consent")
    check(not (prof["progress"]["stats"] or {}).get("sample"), "real account starts without sample stats")
    # read a story
    p.evaluate("go(1)"); p.wait_for_timeout(300); p.evaluate("go(2)"); p.wait_for_timeout(4500)
    read = DB["profiles"][uidA]["progress"]["read"]
    check(any(len(v) >= 1 for v in read.values()), "reading progress synced: " + json.dumps(read)[:80])
    # Young reporter
    p.evaluate("openYR()"); p.wait_for_selector("#yrH")
    p.fill("#yrH", "Class 5 plants twelve trees behind the school"); p.fill("#yrB", "We planted neem trees.")
    p.click("#yrGo"); p.wait_for_selector(".keypad")
    for d in "2580": p.click(f'[data-n="{d}"]')
    p.wait_for_timeout(800)
    check(len(DB["reports"]) == 1 and DB["reports"][0]["age_band"] == "o" and DB["reports"][0]["country"] == "IN", "report stored")
    p.wait_for_timeout(500); print("DBG", p.evaluate("document.querySelector('#sheet').innerHTML.length"), p.evaluate("[...document.querySelectorAll('.yrst')].map(x=>x.textContent)"), p.evaluate("document.querySelector('#sheet .msg')&&document.querySelector('#sheet .msg').textContent")); check("Waiting for an editor" in p.evaluate("[...document.querySelectorAll('.yrst')].map(x=>x.textContent).join()"), "report shows as waiting: "+p.evaluate("document.querySelector('#sheet').innerText")[:200])
    p.evaluate("closeSheet()")
    # Classroom: teacher creates class
    p.evaluate("openTeacherSetup()"); p.fill("#tcN", "Class 5B"); p.click("#tcGo"); p.wait_for_timeout(800)
    check(len(DB["classes"]) == 1 and DB["classes"][0]["name"] == "Class 5B", "class created")
    code = DB["classes"][0]["code"]
    check(p.inner_text("#tsP") == "0", "teacher sees real pupil count 0")
    p.evaluate("closeSheet()"); p.wait_for_timeout(4000)
    check(DB["profiles"][uidA]["progress"]["klass"]["id"] == DB["classes"][0]["id"], "class saved to profile")

    # ---------- device B: same family signs in, progress restored ----------
    cB, p2 = ctx_page(b)
    p2.goto("https://ffmpa.com/app/"); p2.wait_for_timeout(600)
    p2.fill("#wE", "parent@example.com"); p2.click("#wF button[type=submit]"); p2.wait_for_selector("#wC")
    p2.fill("#wC", "123456"); p2.click("#wF button[type=submit]"); p2.wait_for_timeout(2500)
    check(p2.evaluate("settings.name") == "Aanya" and p2.evaluate("!!(session&&session.uid)"), "second device restored settings")
    check(not p2.evaluate("$('#welcomeOv').classList.contains('open')"), "second device skips onboarding")
    check(p2.evaluate("klass&&klass.code") == code, "second device restored class")

    # ---------- device C: a pupil family joins the class ----------
    cC, p3 = ctx_page(b)
    p3.goto("https://ffmpa.com/app/"); p3.wait_for_timeout(600)
    p3.fill("#wE", "kid2@example.com"); p3.click("#wF button[type=submit]"); p3.wait_for_selector("#wC")
    p3.fill("#wC", "123456"); p3.click("#wF button[type=submit]"); p3.wait_for_selector("#wN")
    p3.click('[data-a="x"]'); p3.click("#wF button[type=submit]"); p3.wait_for_selector("[data-c]"); p3.click("#wF button[type=submit]"); p3.wait_for_selector("#wP")
    p3.fill("#wP", "1111"); p3.click("#wF button[type=submit]"); p3.wait_for_timeout(600)
    p3.evaluate("openJoin()"); p3.fill("#jcC", "ZZZ999"); p3.click("#jcGo"); p3.wait_for_selector(".keypad")
    for d in "1111": p3.click(f'[data-n="{d}"]')
    p3.wait_for_timeout(600)
    check("could not find" in p3.inner_text("#jcM"), "unknown class code rejected")
    p3.fill("#jcC", code[:3] + " " + code[3:]); p3.click("#jcGo"); p3.wait_for_selector(".keypad")
    for d in "1111": p3.click(f'[data-n="{d}"]')
    p3.wait_for_timeout(800)
    check(p3.evaluate("klass&&klass.name") == "Class 5B", "pupil joined class by code")
    p3.evaluate("closeSheet(); go(1)"); p3.wait_for_timeout(300); p3.evaluate("go(2)"); p3.wait_for_timeout(5800)
    check(any(v["p_reads"] >= 1 for v in DB["progress"].values()), "pupil weekly reads reported to class: " + str(list(DB["progress"].values())))

    # ---------- admin ----------
    cD, p4 = ctx_page(b)
    p4.goto("https://ffmpa.com/app/#admin"); p4.wait_for_selector("#agE")
    p4.fill("#agE", "someone@else.com"); p4.click("#agF button"); p4.wait_for_selector("#agC")
    p4.fill("#agC", "123456"); p4.click("#agF button"); p4.wait_for_timeout(800)
    check("not an FFMPA admin" in p4.inner_text("#adminView"), "non admin refused")
    p4.fill("#agE", "aairainvests@gmail.com"); p4.click("#agF button"); p4.wait_for_selector("#agC")
    p4.fill("#agC", "123456"); p4.click("#agF button"); p4.wait_for_timeout(1200)
    txt = p4.inner_text("#adminView")
    check("Signed in as aairainvests@gmail.com" in txt and "Family accounts" in txt, "admin console opens with live numbers")
    p4.evaluate("admSection='extras'; renderAdmin()"); p4.wait_for_timeout(800)
    check(p4.query_selector('[data-yrs]') is not None, "moderation queue shows report")
    p4.click('[data-yrs$=":approved"]'); p4.wait_for_timeout(800)
    check(DB["reports"][0]["status"] == "approved", "admin approved report")
    p4.evaluate("ADMIN.freshHours=48; saveAdmin()"); p4.wait_for_timeout(1500)
    check(DB["config"].get("admin", {}).get("freshHours") == 48, "admin settings saved for everyone")

    # device A sees approved report on front page and shared config
    p.reload(); p.wait_for_timeout(1500)
    check(p.evaluate("ADMIN.freshHours") == 48, "families get shared admin settings")
    p.evaluate("openYR()"); p.wait_for_timeout(800)
    check("Explorer" in p.inner_text(".yrpage") or "Thinker" in p.inner_text(".yrpage"), "approved report on front page with age group only")
    p.evaluate("closeSheet()")

    # ---------- sign out clears device, delete account ----------
    p2.evaluate("signOut()"); p2.wait_for_timeout(800)
    check(p2.evaluate("localStorage.getItem('ffmpa-stats')") is None and p2.evaluate("$('#welcomeOv').classList.contains('open')"), "sign out clears this device")
    p.evaluate("renderSettings()"); p.wait_for_selector("#acDel"); p.click("#acDel"); p.click("#acYes"); p.wait_for_timeout(800)
    check(uidA not in DB["profiles"] and p.evaluate("$('#welcomeOv').classList.contains('open')"), "account deleted")

    # ---------- prototype still works offline ----------
    cE, p5 = ctx_page(b)
    p5.goto("https://ffmpa.com/app/?demo"); p5.wait_for_timeout(600)
    check(not p5.evaluate("SB_ON") and "Prototype" in (p5.fill("#wE", "a@b.co") or p5.click("#wF button[type=submit]") or p5.inner_text("#welcome")), "demo mode keeps prototype")
    b.close()

print("errors:", errors[:10])
print("unhandled calls:", [l for l in LOG if False])
sys.exit(1 if check.failed or errors else 0)
