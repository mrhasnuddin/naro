import { defineConfig, loadEnv, type HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const configured =
    env.VITE_SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "");
  let site = "";
  if (configured) {
    const url = new URL(configured);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error("VITE_SITE_URL must be a public HTTP(S) website URL.");
    url.search = "";
    url.hash = "";
    site = url.href.replace(/\/$/, "");
  } else if (env.VERCEL) {
    throw new Error(
      "Set VITE_SITE_URL to the public production URL, or enable Vercel System Environment Variables for social previews.",
    );
  }
  const title = "NARO | BNB Testnet Demo";
  const description =
    "Your wallet, rewards and community. Explore the NARO learning demo on BNB testnet. Demo tokens have no monetary value.";
  const image = (name: string) => `${site || "."}/social/naro-${name}.png`;
  const meta = (
    key: string,
    value: string,
    twitter = false,
  ): HtmlTagDescriptor => ({
    tag: "meta",
    attrs: { [twitter ? "name" : "property"]: key, content: value },
    injectTo: "head",
  });
  const tags: HtmlTagDescriptor[] = [
    meta("og:type", "website"),
    meta("og:site_name", "NARO"),
    meta("og:title", title),
    meta("og:description", description),
    meta("og:locale", "en_US"),
  ];
  for (const [name, height] of [
    ["landscape", "630"],
    ["square", "1200"],
  ]) {
    tags.push(
      meta("og:image", image(name)),
      meta("og:image:type", "image/png"),
      meta("og:image:width", "1200"),
      meta("og:image:height", height),
      meta(
        "og:image:alt",
        "NARO. Your NARO, in one place. BNB testnet learning demo; no monetary value.",
      ),
    );
  }
  tags.push(
    meta("twitter:card", "summary_large_image", true),
    meta("twitter:title", title, true),
    meta("twitter:description", description, true),
    meta("twitter:image", image("landscape"), true),
    meta(
      "twitter:image:alt",
      "NARO BNB testnet learning demo. Your wallet, rewards and community.",
      true,
    ),
  );
  if (site)
    tags.push(meta("og:url", `${site}/`), {
      tag: "link",
      attrs: { rel: "canonical", href: `${site}/` },
      injectTo: "head",
    });
  return {
    plugins: [
      react(),
      { name: "naro-social-metadata", transformIndexHtml: () => tags },
    ],
    base: "./",
    server: { fs: { allow: [".."] } },
    build: { outDir: "dist", emptyOutDir: true },
  };
});
