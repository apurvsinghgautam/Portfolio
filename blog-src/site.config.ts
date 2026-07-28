// Single source of truth for the blog. Everything the build needs lives here.

export const site = {
  title: "Apurv Singh Gautam | Threat Researcher",
  author: "Apurv Singh Gautam",
  authorBio: "Threat researcher — cybercrime & dark-web intelligence.",
  description: "Research notes, dark-web tradecraft, and career field guides.",
  url: "https://apurvsinghgautam.me",
  baseurl: "/blog",
  social: {
    linkedin: "apurvsinghgautam",
    github: "apurvsinghgautam",
    twitter: "ASG_Sc0rpi0n",
  },
} as const;

/**
 * Maps the categories used in post frontmatter onto the four chips the design
 * defines. First category with an entry wins; anything unmapped falls back to
 * `categoryDefault`.
 */
export const categoryMap: Record<string, string> = {
  DarkWeb: "OSINT",
  Ransomware: "MALWARE",
  Blockchain: "FORENSICS",
  Privacy: "PRIVACY",
  Anonymity: "PRIVACY",
  Guide: "CAREER",
  Experience: "CAREER",
  "Professional Growth": "CAREER",
};

export const categoryOrder = ["OSINT", "MALWARE", "PRIVACY", "CAREER", "FORENSICS"] as const;
export const categoryDefault = "CAREER";

/** How many entries the portfolio's teaser grid shows. Featured items come first. */
export const teaserCount = 4;

/** Words per minute used for the reading-time estimate. */
export const wordsPerMinute = 250;
