export function testnetApiUrl(
  url: string | undefined,
  chain: string | undefined,
): string | null {
  if (!url || chain !== "97") return null;
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password || parsed.search || parsed.hash)
      return null;
    if (parsed.hostname === "back.naroradar.net") return null;
    if (
      parsed.protocol !== "https:" &&
      !(
        parsed.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname)
      )
    )
      return null;
    return parsed.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}
