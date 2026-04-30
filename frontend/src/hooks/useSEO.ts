import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogType?: "website" | "article";
}

const SITE_NAME = "EliteCode";
const SITE_URL = (import.meta.env.VITE_PUBLIC_URL as string | undefined) ?? "https://elitecode.pro";

function getOrCreateMeta(attr: "name" | "property", value: string): HTMLMetaElement {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  return el;
}

function getOrCreateCanonical(): HTMLLinkElement {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  return el;
}

export function useSEO({ title, description, canonicalPath, ogType = "website" }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

    document.title = fullTitle;
    getOrCreateMeta("property", "og:title").content = fullTitle;
    getOrCreateMeta("property", "og:type").content = ogType;
    getOrCreateMeta("name", "twitter:title").content = fullTitle;

    if (description) {
      getOrCreateMeta("name", "description").content = description;
      getOrCreateMeta("property", "og:description").content = description;
      getOrCreateMeta("name", "twitter:description").content = description;
    }

    if (canonicalPath !== undefined) {
      const url = `${SITE_URL}${canonicalPath}`;
      getOrCreateCanonical().href = url;
      getOrCreateMeta("property", "og:url").content = url;
    }
  }, [title, description, canonicalPath, ogType]);
}
