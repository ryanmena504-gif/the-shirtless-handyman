/**
 * Page wrapper that injects route-specific meta tags via react-helmet-async.
 *
 * Removes any conflicting static tags from index.html so Google sees a single
 * canonical / description / og:title / og:url / og:description per page.
 */
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

const STATIC_TAGS_TO_DEDUPE = [
  { selector: "meta[name='description']", attr: "name", value: "description" },
  { selector: "link[rel='canonical']", attr: "rel", value: "canonical" },
  { selector: "meta[property='og:title']", attr: "property", value: "og:title" },
  { selector: "meta[property='og:description']", attr: "property", value: "og:description" },
  { selector: "meta[property='og:url']", attr: "property", value: "og:url" },
  { selector: "meta[property='og:image']", attr: "property", value: "og:image" },
  { selector: "meta[name='twitter:title']", attr: "name", value: "twitter:title" },
  { selector: "meta[name='twitter:description']", attr: "name", value: "twitter:description" },
  { selector: "meta[name='twitter:image']", attr: "name", value: "twitter:image" },
];

/**
 * SeoHead — render-time component that:
 *   1. Mounts react-helmet-async <Helmet> with the page's title/description/canonical/og.
 *   2. After mount, removes any duplicate tags that originated from index.html so the
 *      crawler sees exactly one canonical/description/og per route.
 *
 * Children passed inside are rendered as additional <Helmet> entries
 * (typically the route-specific JSON-LD <script> tag).
 */
export function SeoHead({ title, description, canonical, ogImage, ogType = "website", children }) {
  useEffect(() => {
    // Wait one tick so Helmet has already inserted its tags before we dedupe.
    const t = setTimeout(() => {
      STATIC_TAGS_TO_DEDUPE.forEach(({ selector }) => {
        const tags = document.querySelectorAll(selector);
        // Keep the LAST one (Helmet appends after the static, so the last is the route-specific).
        for (let i = 0; i < tags.length - 1; i++) {
          tags[i].parentNode?.removeChild(tags[i]);
        }
      });
    }, 0);
    return () => clearTimeout(t);
  });

  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta property="og:type" content={ogType} />
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {children}
    </Helmet>
  );
}
