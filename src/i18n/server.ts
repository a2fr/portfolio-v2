import { cookies, headers } from "next/headers";
import { LANG_COOKIE, type Lang, isLang, pickLanguage } from "./langs";

/**
 * The language to render this request in: the one the visitor last picked with a flag, else the first of their
 * browser's preferred languages (its Accept-Language header, which follows the computer's language) the site has.
 */
export async function requestLanguage(): Promise<Lang> {
  const picked = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(picked)) return picked;
  const accept = (await headers()).get("accept-language") ?? "";
  // "fr-FR,fr;q=0.9,en;q=0.8": most preferred first, by quality then by order.
  const preferred = accept
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.trim(), q: q ? Number(q.slice(2)) || 0 : 1, index };
    })
    .filter(({ tag, q }) => tag && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map(({ tag }) => tag);
  return pickLanguage(preferred);
}
