import type { Subscription } from "../types.js";

/**
 * Interface for Database adapter.
 * Implement these for your chosen database backend.
 */
export interface DbAdapter {
  /** Fetch all subscriptions across all guilds. Used by the scheduler */
  getSubscriptions(): Promise<Subscription[]>;
  /** Fetch all subscription for a specific guild */
  getSubscriptionByGuild(guildId: string): Promise<Subscription[]>;
  /** Adds a subscription to a specific channel within a guild.
   * By default it uses the channel the command was sent in, but can be provided with a different channel.
   * No need to provide id or createdAt, as that's handled on creation.
   */
  addSubscription(
    sub: Omit<Subscription, "id" | "createdAt">,
  ): Promise<Subscription>;
  /** Removes a subscription from the database. */
  removeSubscription(id: string): Promise<void>;
  /** This is updated by the scheduler, keeps track of the last post to avoid duplicates. */
  updateLastSeen(id: string, lastSeenId: string): Promise<void>;
  /** This is updated by the scheduler if there is any error. (I.E no response from the source) */
  updateLastError(id: string, lastError: string): Promise<void>;
}
