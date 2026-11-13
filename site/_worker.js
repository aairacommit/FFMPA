export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/s") return Response.redirect(url.origin + "/s/", 301);
    if (url.pathname.startsWith("/s/")) {
      try {
        const r = await fetch("https://ffmpa-newsroom-317244127832.asia-south1.run.app" + url.pathname + url.search, {
          headers: { "Accept": request.headers.get("Accept") || "*/*", "User-Agent": request.headers.get("User-Agent") || "ffmpa-pages" },
          cf: { cacheTtl: 300, cacheEverything: true } });
        return new Response(r.body, { status: r.status, headers: r.headers });
      } catch (e) {
        return new Response("Stories are taking a break. Please try again in a minute.", { status: 503 });
      }
    }
    return env.ASSETS.fetch(request);
  }
};
