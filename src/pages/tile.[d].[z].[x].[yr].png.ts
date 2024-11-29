import type { APIContext } from "astro";

export async function GET(ctx: APIContext) {
  const NUMERIC = /[0-9]+/;

  const { d, z, x, yr } = ctx.params;
  const [y, r] = yr!.split('@');

  if (!['l', 'd'].includes(d!)) {
    return badRequest(`"${d}" must be one either "l" or "d".`);
  }
  if (!(NUMERIC.test(z!) && NUMERIC.test(x!) && NUMERIC.test(y!))) {
    return badRequest(`"${z}", "${x}", "${y}" must be integers.`);
  }
  if ('' !== r && '2x' !== r) {
    return badRequest(`"${r}" must be "2x"`);
  }
  const vals = {
    z: +z!,
    x: +x!,
    y: +y!,
    r: r && `@${r}`, // "" or "@2x".
  };

  const URL = 'l' === d ? ctx.locals.runtime.env.MAP_URL_LIGHT : ctx.locals.runtime.env.MAP_URL_DARK;
  const reqUrl = URL.replace(/\{([a-z]+)\}/g, (_match: string, key: keyof typeof vals) => vals[key]);

  console.log(reqUrl);
  const response = await fetch(reqUrl);

  const newHeaders = new Headers(response.headers);
  const CACHE_TIME_SECS = 7 * 24 * 3600;
  newHeaders.set('Cache-Control', `public, max-age=${CACHE_TIME_SECS}`);
  newHeaders.set('Expires', new Date(Date.now() + CACHE_TIME_SECS * 1000).toUTCString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

function badRequest(msg: string): Response {
  return new Response(msg, {
    status: 400,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}