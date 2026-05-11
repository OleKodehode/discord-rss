import Parser from "rss-parser";
import { getItemId, type FeedItem } from "../types.js";

const rssParser = new Parser();

export async function fetchFeed(url: string): Promise<FeedItem[]> {
  try {
    const feed = await rssParser.parseURL(url);
    const items: FeedItem[] = feed.items.map((item) => {
      const feedItem: FeedItem = {
        title: item.title ?? "No title",
        link: item.link ?? "",
        pubDate: item.pubDate ?? "",
        contentSnippet: item.contentSnippet ?? "",
        guid: item.guid,
      };
      return { ...feedItem, guid: getItemId(feedItem) };
    });

    return items;
  } catch {
    return [];
  }
}
