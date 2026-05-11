import type { FeedItem } from "../types.js";

export function filterItems(items: FeedItem[], keywords: string[]): FeedItem[] {
  if (!keywords.length) return items;

  return items.filter((item) => {
    const searchText = [
      item.title,
      item.contentSnippet?.replace(/<[^>]*>/g, " "),
      item.content?.replace(/<[^>]*>/g, " "),
    ]
      .join(" ")
      .toLowerCase();

    return keywords.some((word) => searchText.includes(word.toLowerCase()));
  });
}
