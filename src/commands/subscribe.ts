import type { ChatInputCommandInteraction } from "discord.js";
import type { DbAdapter } from "../db/adapter.js";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { FEED_INTERVALS, type FeedInterval } from "../types.js";
import { createSubscription } from "./helpers.js";

const intervalChoices = FEED_INTERVALS.map((interval) => ({
  name: `${interval} minutes`,
  value: interval,
}));

export const data = new SlashCommandBuilder()
  .setName("subscribe")
  .setDescription("Subscribe to an RSS feed using this channel.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption((option) =>
    option
      .setName("interval")
      .setDescription("How often to check the feed (in minutes)")
      .setRequired(true)
      .addChoices(...intervalChoices),
  )
  .addStringOption((option) =>
    option
      .setName("url")
      .setDescription("The RSS Feed URL to subscribe to")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("filter")
      .setDescription(
        "Keywords to filter by - Comma separated. Example: junior, developer, oslo",
      )
      .setRequired(false),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  db: DbAdapter,
) {
  const url = interaction.options.getString("url", true);
  const interval = interaction.options.getInteger(
    "interval",
    true,
  ) as FeedInterval;
  const filter = interaction.options.getString("filter") ?? "";

  const guildId = interaction.guildId;
  const channelId = interaction.channelId;

  if (!guildId || !channelId) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      flags: "Ephemeral",
    });
    return;
  }

  await createSubscription(
    interaction,
    db,
    url,
    interval,
    filter,
    guildId,
    channelId,
  );
}
