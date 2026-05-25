export const SITE_NAME = "Beacon Digest";

// Builds the <title>, og:title, and twitter:title meta entries for a page.
// Pass the page-specific portion (the site name is appended); pass nothing
// for the site name on its own.
export const titleMeta = (page?: string) => {
  const title = page ? `${page} | ${SITE_NAME}` : SITE_NAME;

  return [
    { title },
    { property: "og:title", content: title },
    { name: "twitter:title", content: title },
  ];
};
