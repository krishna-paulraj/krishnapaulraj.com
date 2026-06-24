import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const SOCIAL_PROFILES = [
  "https://x.com/thedevkrish",
  "https://github.com/krishna-paulraj",
  "https://linkedin.com/in/suresh-krishna-paulraj",
];

export function buildSiteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: SITE_AUTHOR,
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        jobTitle: "Software Engineer",
        worksFor: {
          "@type": "Organization",
          name: "Blocsys",
          url: "https://blocsys.com",
        },
        sameAs: SOCIAL_PROFILES,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      },
    ],
  };
}

type BlogPostingInput = {
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  wordCount: number;
  readingTimeMinutes: number;
};

export function buildBlogPostingSchema(post: BlogPostingInput) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${url}/opengraph-image`,
    datePublished: post.createdAt || undefined,
    dateModified: post.updatedAt || post.createdAt || undefined,
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingTimeMinutes}M`,
    inLanguage: "en-US",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
