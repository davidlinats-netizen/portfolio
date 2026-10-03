export const categories = ["Promotional Ads", "Real Estate", "Repurposed Content", "Talking Head", "AI UGC"] as const;
export type Category = (typeof categories)[number];
export type PortfolioVideo = { id: string; title: string; category: Category };
export const videos: PortfolioVideo[] = [
  { id: "_gAA1AWdWvI", title: "Promotional Ad", category: "Promotional Ads" },
  { id: "CSyAbcsqM3Q", title: "Promotional Ad", category: "Promotional Ads" },
  { id: "0JVjIK7EYg0", title: "Real Estate Edit", category: "Real Estate" },
  { id: "kr5bzVjSgzk", title: "Real Estate Edit", category: "Real Estate" },
  { id: "fdzbUmKXYvg", title: "Real Estate Edit", category: "Real Estate" },
  { id: "onsN84mJ19o", title: "Real Estate Edit", category: "Real Estate" },
  { id: "Te6uDAURpw8", title: "Real Estate Edit", category: "Real Estate" },
  { id: "U26yEgl1RNk", title: "Repurpose Video Edit", category: "Repurposed Content" },
  { id: "0QXx_PiDYVw", title: "Repurpose Video Edit", category: "Repurposed Content" },
  { id: "sCK_U_vcTwc", title: "Repurpose Video Edit", category: "Repurposed Content" },
  { id: "y-OUsCWfcEc", title: "Repurpose Video Edit", category: "Repurposed Content" },
  { id: "chQ9u0oOuYw", title: "Talking Head", category: "Talking Head" },
  { id: "xf1fL1_xJJM", title: "Talking Head", category: "Talking Head" },
  { id: "azH8dobash8", title: "Talking Head", category: "Talking Head" },
  { id: "a1OZ8eJdTI0", title: "UGC AI Edit", category: "AI UGC" },
  { id: "9DseglobOag", title: "UGC AI Edit", category: "AI UGC" },
];
export function findVideo(id: string) { return videos.find(video => video.id === id); }
export function validVideoIds(ids: string[]) { return [...new Set(ids)].filter(id => Boolean(findVideo(id))).slice(0, 3); }
