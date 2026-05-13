import cron from "node-cron";
import type { Client } from "discord.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import type { DbAdapter } from "../db/adapter.js";
import type { FeedInterval, FeedItem, Subscription } from "../types.js";
import { FEED_INTERVALS, getItemId } from "../types.js";
import { fetchFeed } from "../rss/fetcher.js";
import { filterItems } from "../rss/filter.js";

function getCronExpression(interval: FeedInterval): string {
  if (interval === 60) return "0 * * * *";
  return `*/${interval} * * * *`;
}

async function processSubscriptions(
  client: Client,
  db: DbAdapter,
  interval: FeedInterval,
): Promise<void> {
  const subscriptions = await db.getSubscriptions();
  const filtered = subscriptions.filter((sub) => sub.interval === interval);

  // Group up identical feeds to avoid duplicate fetches
  const feedMap = new Map<string, typeof filtered>();
  for (const sub of filtered) {
    const existing = feedMap.get(sub.feedUrl) ?? [];
    feedMap.set(sub.feedUrl, [...existing, sub]);
  }

  await Promise.all(
    Array.from(feedMap.entries()).map(([url, subs]) =>
      processFeed(client, db, url, subs),
    ),
  );
}

export function startScheduler(client: Client, db: DbAdapter): void {
  for (const interval of FEED_INTERVALS) {
    cron.schedule(getCronExpression(interval), () => {
      processSubscriptions(client, db, interval);
    });
  }
}

async function processFeed(
  client: Client,
  db: DbAdapter,
  url: string,
  subscriptions: Subscription[],
): Promise<void> {
  // fetch items from URL
  const items: FeedItem[] = await fetchFeed(url);
  // if fetch failed - return empty array and update last error
  if (!items.length) {
    for (const sub of subscriptions) {
      await db.updateLastError(sub.id, new Date().toISOString());
    }
    return;
  }
  // for each sub
  for (const sub of subscriptions) {
    const channel = await client.channels.fetch(sub.channelId);
    if (!channel || !channel.isTextBased()) continue;
    // It's necessary to cast the channel as TextChannel due to Typescript.
    const textChannel = channel as TextChannel;

    const filtered = filterItems(items, sub.filter);

    // find new items based on lastSeenId
    const previousPost = filtered.findIndex(
      (item) => getItemId(item) === sub.lastSeenId,
    );
    const newItems =
      sub.lastSeenId === null
        ? [filtered[0]]
        : previousPost === -1
          ? filtered
          : filtered.slice(0, previousPost);

    newItems.reverse();

    // Post each new item to subscription.channelId
    for (const item of newItems) {
      const embed = buildEmbed(item);
      await textChannel.send({ embeds: [embed] });
    }

    // Update lastSeenId to the newest item
    if (newItems.length > 0)
      await db.updateLastSeen(sub.id, getItemId(newItems[newItems.length - 1]));

    // reset lastError to null if there was a previous error.
    if (sub.lastError) await db.updateLastError(sub.id, null);
  }
}

function buildEmbed(item: FeedItem): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(item.title ?? "New Item")
    .setURL(item.link || null)
    .setDescription(item.contentSnippet ?? null)
    .setFooter({ text: item.pubDate ?? "" })
    .setColor(0x5865f2); // Discord's Blue color
}
