import type { ChatInputCommandInteraction } from "discord.js";
import type { DbAdapter } from "../db/adapter.js";
import type { FeedInterval } from "../types.js";

export async function createSubscription(
  interaction: ChatInputCommandInteraction,
  db: DbAdapter,
  url: string,
  interval: FeedInterval,
  filter: string,
  guildId: string,
  channelId: string,
  channelName?: string,
) {
  const channelRef = channelName ? `<#${channelId}>` : "this channel";
  try {
    new URL(url);
  } catch {
    await interaction.reply({ content: "Invalid URL", flags: "Ephemeral" });
    return;
  }

  const filters = filter
    ? filter
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean) // Should filter out empty strings
    : [];

  await db.addSubscription({
    guildId: guildId,
    channelId: channelId,
    feedUrl: url,
    filter: filters,
    interval: interval,
    lastSeenId: null,
    lastError: null,
  });

  await interaction.reply({
    content: `Ok - I've added ${url} to ${channelRef}'s subscriptions.`,
    flags: "Ephemeral",
  });
}
