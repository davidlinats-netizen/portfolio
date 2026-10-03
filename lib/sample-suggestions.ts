import { videos, type Category } from "./videos";

export function nextSamples(shownIds: string[], category: Category | null) {
  const remaining = videos.filter(video => !shownIds.includes(video.id) && (!category || video.category === category));
  // Start with a spread of formats for general requests, then fill remaining slots.
  const diverse = remaining.filter((video, index) => remaining.findIndex(item => item.category === video.category) === index);
  return [...diverse, ...remaining.filter(video => !diverse.includes(video))].slice(0, 3);
}
