/* ================= Legal and policy pages (hash routes) ================= */
const DRAFT = `<p class="draft"><b>Draft for legal review.</b> Items in square brackets must be confirmed by Founderfreedom Ventures LLP and its counsel before launch.</p>`;
const ENTITY = `Founderfreedom Ventures LLP, a limited liability partnership registered in India, based in Bangalore, India`;
const LEGAL = {
  safety:{t:"Content and safety standards", h:`
    <p class="summary">FFMPA exists to give children real news without the parts that frighten, confuse or harm them. These are the rules every story must pass before it reaches a child.</p>
    <h3>1. Freshness</h3>
    <ul><li>Two editions a day, at 6:00 AM and 7:00 PM in the child's country.</li><li>Only news first reported in the last 72 hours. Older stories are removed automatically.</li><li>Short explainers about dates in the coming week (festivals, observances, sky events) are clearly labelled as such.</li><li>Each edition holds 12 to 20 stories, mixing local news for the child's country with world news.</li></ul>
    <h3>2. How a story is made</h3>
    <ul><li>Stories are gathered from established news organisations, wire services, official bodies and scientific institutions.</li><li>Every fact must appear in at least two reputable sources, or one primary source such as an official statement.</li><li>A draft is written in two reading levels with software assistance, then read, corrected and approved by a human editor. Nothing is published automatically.</li><li>Sources are named under every story.</li></ul>
    <h3>3. Language rules</h3>
    <ul><li>No swearing, slurs, insults or mocking language of any kind, including in quotes.</li><li>No graphic description of violence, injury, illness, crime or death. Numbers of people hurt are given only when essential, without detail.</li><li>No sexual content, and no detail about drugs, alcohol, gambling or weapons.</li><li>No fear words or sensational headlines (for example: horror, terrifying, shocking, nightmare).</li><li>Victims, suspects and children involved in news events are never named or pictured.</li><li>Explorers (5 to 9): short sentences, everyday words, and every harder word explained.</li><li>Thinkers (10 to 12): fuller context and real terms, each explained the first time it appears.</li><li>Navigators (13 to 15): the Thinkers text plus wider context, a question worth arguing about and the jobs behind the story.</li></ul>
    <h3>4. Topics we never cover</h3>
    <ul><li>Suicide and self-harm, sexual violence and abuse, details of terror attacks or mass casualty events, crime stories told for shock, celebrity gossip, and gambling or betting.</li><li>War and conflict are covered only at the Thinkers and Navigators levels, calmly and factually, and parents can switch them off.</li><li>Disasters are covered with a focus on what happened, how people are being helped and how to stay safe.</li></ul>
    <h3>5. Fairness in politics and belief</h3>
    <ul><li>We explain how things work (elections, parliaments, courts) and what happened. We do not tell children what to think.</li><li>Leaders and parties are described with the same tone and the same care. Opinions are labelled as someone's opinion.</li><li>Religions, cultures and countries are described with respect.</li></ul>
    <h3>6. Layers of protection</h3>
    <ul><li>An automatic word filter and a sensitive topic classifier screen every draft.</li><li>A human editor approves every story and every explainer.</li><li>Parents choose topics, reading level, sensitive news and daily limits behind a PIN.</li><li>No comments, chat, messaging or user uploads, and no links to other websites anywhere in the app. Sources and photo credits are named in plain text.</li><li>No personalised ads. Editions may include a small number of sponsor cards labelled Sponsored, each approved by our team, shown the same way to every child in a country, and switched off at the Explorers level by default.</li><li>Sharing sends only a public link to the story. It never includes the child's name, saved words or settings, and parents can turn sharing off.</li></ul>
    <h3>7. Photos</h3><p>We only use photos that are free to use: public domain images, Creative Commons images used under their licence, and official press or government libraries. Each photo is credited in plain text. When a photo is missing or not suitable for children, we show a neutral graphic instead. We never use AI-generated images of real people or real events.</p><h3>8. Corrections</h3>
    <p>If we get something wrong, we fix it in the next edition and add a short correction note to the story. Report a problem to [safety@ffmpa.com].</p>`},
  privacy:{t:"Privacy policy", h:`${DRAFT}
    <p class="summary"><b>In short:</b> we collect the least we can. A grown-up's email, a child's first name or nickname (optional), a reading level, a country and preferences. No personalised or targeted ads, no selling of data, no tracking across other sites, no profiling of children, no photos of your child and no precise location.</p>
    <h3>1. Who we are</h3><p>FFMPA (ffmpa.com) is operated by ${ENTITY} ("we", "us"). We are the data fiduciary (India) and data controller (UK and EU) for personal data processed through FFMPA.</p>
    <h3>2. Who FFMPA is for</h3><p>FFMPA is a news service for children aged 5 to 15, used under the account and supervision of a parent or legal guardian aged 18 or over. Accounts can only be created by an adult. Children cannot create accounts or sign in on their own.</p>
    <h3>3. What we collect and why</h3>
    <div class="tablewrap"><table><thead><tr><th>Data</th><th>From</th><th>Why</th></tr></thead><tbody>
      <tr><td>Parent or guardian email address</td><td>Parent</td><td>Sign in by one-time code, account security, essential service messages</td></tr>
      <tr><td>Child's first name or nickname (optional)</td><td>Parent</td><td>Personal greeting on the home screen</td></tr>
      <tr><td>Reading level, country, topic choices, limits, PIN (stored as a secure hash)</td><td>Parent</td><td>Showing the right edition and keeping parent controls in place</td></tr>
      <tr><td>Stories read, saved words, quiz scores</td><td>Use of the service</td><td>Reading goal, word bank and progress for the child</td></tr>
      <tr><td>Basic technical data (device type, app version, error logs)</td><td>Automatically</td><td>Keeping the service working and secure</td></tr>
    </tbody></table></div>
    <p>We do not collect a child's surname, date of birth, school, photo, voice recording, contact details or precise location. Read aloud uses the speech feature built into your device; no audio is sent to us.</p>
    <h3>4. Parental consent</h3><p>Before any child profile is created, the parent or guardian verifies their email address with a one-time code and confirms that they are the child's parent or guardian. This is how we obtain verifiable consent as required by the Digital Personal Data Protection Act, 2023 (India), the Children's Online Privacy Protection Act (United States) and UK data protection law. The DPDP Rules, 2025 set out how a parent's identity and adult status must be verified, with the child data provisions due to apply from May 2027; we will add any extra verification step they require before then. [Counsel to confirm the method for each launch country.]</p>
    <h3>5. What we never do</h3><ul><li>We never use children's data for advertising. Any sponsor card is chosen by our team, labelled Sponsored, and shown the same way to every child in a country. If we ever use an outside ad partner, it receives no personal data and must use child-directed settings.</li><li>We never track children's behaviour across other websites or apps, or build profiles about them.</li><li>We never sell or rent personal data.</li></ul>
    <h3>6. Who we share data with</h3><p>When a child shares a story, only a public link to that story is shared; no personal data goes with it. Otherwise we share data only with service providers who help us run FFMPA, namely Supabase (database), Google Cloud (hosting) and Resend (sign-in emails), under written contracts that require them to protect the data and use it only for us. [List of providers to be published.] We may disclose data if the law requires it.</p>
    <h3>7. Where data is stored</h3><p>Data is stored on servers in [region, for example Google Cloud and Supabase in Mumbai, India]. Where data is transferred across borders, we use the safeguards required by applicable law.</p>
    <h3>8. How long we keep it</h3><p>Account data is kept while the account is active and deleted within [30] days after the account is closed. Security logs are kept for up to [90] days.</p>
    <h3>9. Your rights</h3><p>A parent or guardian can at any time access, correct or delete their own and their child's data, withdraw consent (which closes the child profile), and nominate another person to exercise these rights. Write to [privacy@ffmpa.com]. You can also complain to the Data Protection Board of India, the UK Information Commissioner's Office, or the US Federal Trade Commission.</p>
    <h3>10. Security</h3><p>We use encryption in transit, hashed PINs, one-time sign-in codes that expire after 10 minutes, and strict access controls for our team.</p>
    <h3>11. Grievance Officer</h3><p>[Name], Grievance Officer, Founderfreedom Ventures LLP, Bangalore, India. Email: [grievance@ffmpa.com]. We acknowledge complaints within 24 hours and aim to resolve them within 15 days.</p>
    <h3>12. Changes</h3><p>If we change this policy in a way that affects how we use data, we will email the account holder before the change takes effect. Last updated: [date].</p>`},
  terms:{t:"Terms of use", h:`${DRAFT}
    <h3>1. About these terms</h3><p>These terms govern use of FFMPA at ffmpa.com and in any FFMPA app, provided by ${ENTITY}. By creating an account you agree to them on your own behalf and on behalf of each child who uses FFMPA under your account.</p>
    <h3>2. Accounts</h3><ul><li>You must be 18 or over and the parent or legal guardian of any child who uses your account.</li><li>You sign in with your email address and a one-time code. Keep access to your email secure.</li><li>You are responsible for setting your grown-ups PIN and for supervising your child's use.</li></ul>
    <h3>3. What FFMPA provides</h3><ul><li>Short news stories and explainers for children aged 5 to 15, in English, in two editions a day, covering news from the last 3 days.</li><li>Some editions include clearly labelled sponsor cards that we approve. Sponsors never receive information about you or your child.</li><li>Stories are written for learning and general awareness. They are not professional, medical, legal or financial advice.</li><li>We work hard to be accurate and fair, but news changes quickly and we may make mistakes. Tell us at [support@ffmpa.com] and we will correct them.</li></ul>
    <h3>4. Fair use</h3><p>FFMPA is for personal, non-commercial family use. Do not copy, scrape, resell or republish our stories, try to get around security or parent controls, or interfere with the service. Schools and organisations need a separate agreement.</p>
    <h3>5. Ownership</h3><p>Our stories, explainers, quizzes, design and software belong to Founderfreedom Ventures LLP or its licensors. Original news reports belong to their publishers and photos belong to their creators; we name and credit them, and we do not reproduce their articles.</p>
    <h3>6. Plans and payments</h3><p>FFMPA is currently free. If paid plans are introduced, prices, renewal and cancellation terms will be shown clearly before you pay. [Section to be completed before any paid launch.]</p>
    <h3>7. Ending your account</h3><p>You can close your account at any time from parent settings or by writing to us. We may suspend accounts that break these terms or put children at risk.</p>
    <h3>8. Responsibility</h3><p>To the extent the law allows, FFMPA is provided as is, and our total liability for any claim is limited to the amount you paid us in the 12 months before the claim (or INR 1,000 if you paid nothing). Nothing in these terms limits rights you have under consumer protection law where you live.</p>
    <h3>9. Law and disputes</h3><p>These terms are governed by the laws of India, and the courts at Bengaluru have jurisdiction, without removing any mandatory rights you have in your own country.</p>
    <h3>10. Grievances and contact</h3><p>Grievance Officer: [Name], [grievance@ffmpa.com]. General help: [support@ffmpa.com].</p>
    <h3>11. Changes</h3><p>We will email account holders about important changes at least 15 days before they take effect. Last updated: [date].</p>`},
  cookies:{t:"Cookies and storage", h:`${DRAFT}
    <p class="summary">FFMPA uses no advertising or tracking cookies. We only store what the app needs to work on your device.</p>
    <div class="tablewrap"><table><thead><tr><th>Item</th><th>Purpose</th><th>Kept for</th></tr></thead><tbody>
      <tr><td>Session</td><td>Keeps the grown-up signed in on this device</td><td>Until sign out or 30 days</td></tr>
      <tr><td>Settings</td><td>Reading level, country, topics and limits</td><td>Until sign out</td></tr>
      <tr><td>Word bank and reading progress</td><td>Saved words and today's reading goal</td><td>Until sign out</td></tr>
      <tr><td>Analytics choice (website only)</td><td>Remembers whether you allowed visit counting on the public website</td><td>Until you clear it</td></tr>
    </tbody></table></div>
    <p>Because these are strictly necessary for the service you asked for, no consent banner is needed. The app that children use has no analytics. The public website for grown-ups (the pages on ffmpa.com outside the app) can use Google Analytics to count visits. It is off until you choose Allow on the notice at the bottom of the page, and you can change your mind by clearing this site's data in your browser.</p>`},
  contact:{t:"Contact", h:`${DRAFT}
    <p>FFMPA is a product of ${ENTITY}.</p>
    <ul><li>General help: [support@ffmpa.com]</li><li>Privacy and data requests: [privacy@ffmpa.com]</li><li>Report a story or safety concern: [safety@ffmpa.com]</li><li>Grievance Officer: [Name], [grievance@ffmpa.com]</li></ul>
    <p>We reply to safety reports within one working day.</p>`}
};
const LEGAL_ORDER = ["safety","privacy","terms","cookies","contact"];
function renderLegal(key){
  const d = LEGAL[key]; if(!d) return;
  $("#legal").innerHTML = `
    <header>
      <button class="x" id="lgClose" aria-label="Close">✕</button>
      <h2 id="lgTitle">${d.t}</h2>
      <nav aria-label="Policies">${LEGAL_ORDER.map(k=>`<a class="chip" href="#${k}" aria-pressed="${k===key}" ${k===key?'aria-current="page"':""}>${LEGAL[k].t}</a>`).join("")}</nav>
    </header>
    <div class="lbody">${d.h}<p style="color:var(--muted);font-size:14px;margin-top:24px">FFMPA · Founderfreedom Ventures LLP</p></div>`;
  $("#legal").querySelectorAll('.chip[aria-pressed="true"]').forEach(c=>{ c.style.background="var(--ink)"; c.style.color="#fff"; c.style.borderColor="var(--ink)"; });
  $("#lgClose").onclick = closeLegal;
  $("#legal").scrollTop = 0;
  if(!$("#legalOv").classList.contains("open")){ lastFocus = document.activeElement; $("#legalOv").classList.add("open"); }
  $("#lgClose").focus();
}
function closeLegal(){
  $("#legalOv").classList.remove("open");
  try{ history.replaceState(null, "", location.pathname + location.search); }catch(e){ location.hash = ""; }
  if(lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
