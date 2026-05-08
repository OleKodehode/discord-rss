export type FeedInterval = 15 | 30 | 60;

export interface Subscription {
  id: string; // individual ids for subscriptions
  guildId: string; // Discord Server ID
  channelId: string; // Discord Channel ID
  feedUrl: string;
  filter: string[];
  interval: FeedInterval; // Can only be 15, 30 or 60 minutes.
  lastSeenId: string | null; // Last post - Avoid duplicates
  lastError: string | null; // In case of errors
  createdAt: string; // ISO timestamp
}
