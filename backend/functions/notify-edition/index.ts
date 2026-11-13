// FFMPA edition alerts. Called every 10 minutes by pg_cron (see backend/push.sql).
// Safe to call by anyone: it only ever sends one alert per published edition, and only for today's edition.
// Push messages carry no data, so no payload encryption is needed; the service worker reads the edition itself.
// Signing keys are generated here on first run and kept in a table only the service role can read.
import { createClient } from "jsr:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const EDITION = "https://raw.githubusercontent.com/aairacommit/FFMPA/main/editions/latest.json";
const enc = new TextEncoder();
const b64u = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

type Keys = { priv: CryptoKey; pub: string };
async function loadKeys(): Promise<Keys> {
  const read = async () => (await sb.from("push_keys").select("private_jwk,public_key").eq("id", 1).maybeSingle()).data;
  let row = await read();
  if (!row) {
    const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]) as CryptoKeyPair;
    const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
    const pub = b64u(await crypto.subtle.exportKey("raw", kp.publicKey));
    await sb.from("push_keys").insert({ id: 1, private_jwk: jwk, public_key: pub });
    row = await read(); // another run may have won the race; use whatever is stored
  }
  await sb.from("app_config").upsert({ key: "vapid_public", value: row!.public_key });
  const priv = await crypto.subtle.importKey("jwk", row!.private_jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  return { priv, pub: row!.public_key };
}

const jwtCache = new Map<string, string>();
async function vapidHeader(endpoint: string, k: Keys) {
  const aud = new URL(endpoint).origin;
  let t = jwtCache.get(aud);
  if (!t) {
    const h = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
    const p = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "mailto:hello@ffmpa.com" })));
    const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, k.priv, enc.encode(`${h}.${p}`));
    t = `${h}.${p}.${b64u(sig)}`;
    jwtCache.set(aud, t);
  }
  return `vapid t=${t}, k=${k.pub}`;
}

Deno.serve(async () => {
  try {
    const k = await loadKeys();
    const e = await fetch(`${EDITION}?h=${Date.now()}`, { cache: "no-store" }).then((r) => r.json());
    const id = `${e.date}-${e.edition}`;
    const todayIST = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
    const last = (await sb.from("app_config").select("value").eq("key", "last_push").maybeSingle()).data?.value;
    if (e.date !== todayIST) return json({ sent: 0, id, reason: "edition is not today's" });
    if (last && last.id === id) return json({ sent: 0, id, reason: "already sent" });
    // claim the edition first so a slow run can never send twice
    await sb.from("app_config").upsert({ key: "last_push", value: { id, at: new Date().toISOString(), status: "sending" } });

    let sent = 0, failed = 0;
    const gone: string[] = [];
    let from = 0;
    while (true) {
      const { data: subs } = await sb.from("push_subs").select("id,endpoint").range(from, from + 499);
      if (!subs || !subs.length) break;
      await Promise.all(subs.map(async (s) => {
        try {
          const r = await fetch(s.endpoint, { method: "POST", headers: { Authorization: await vapidHeader(s.endpoint, k), TTL: "43200", Urgency: "normal", "Content-Length": "0" } });
          if (r.status === 404 || r.status === 410) gone.push(s.id);
          else if (r.ok) sent++;
          else failed++;
        } catch { failed++; }
      }));
      if (subs.length < 500) break;
      from += 500;
    }
    if (gone.length) await sb.from("push_subs").delete().in("id", gone);
    await sb.from("app_config").upsert({ key: "last_push", value: { id, at: new Date().toISOString(), status: "sent", sent, failed, removed: gone.length, stories: (e.stories || []).length } });
    return json({ sent, failed, removed: gone.length, id });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
