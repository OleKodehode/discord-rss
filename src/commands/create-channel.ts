import type { ChatInputCommandInteraction } from "discord.js";
import type { DbAdapter } from "../db/adapter.js";
import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  ChannelType,
} from "discord.js";
import { FEED_INTERVALS, type FeedInterval } from "../types.js";
import { createSubscription } from "./helpers.js";

const intervalChoices = FEED_INTERVALS.map((interval) => ({
  name: `${interval} minutes`,
  value: interval,
}));

export const data = new SlashCommandBuilder()
  .setName("create-channel")
  .setDescription("Create a new channel and subscribe it to an RSS feed.")
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
  )
  .addStringOption((option) =>
    option
      .setName("channel-name")
      .setDescription("The name of the channel you want the RSS feed in")
      .setRequired(true),
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
  const channelName = interaction.options.getString("channel-name", true);

  if (!guildId) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      flags: "Ephemeral",
    });
    return;
  }

  try {
    // Since we have already checked that it's on a server, we can safely assume that interaction.guild isn't null
    const guild = interaction.guild!;
    const newChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
    });

    await createSubscription(
      interaction,
      db,
      url,
      interval,
      filter,
      guildId,
      newChannel.id,
      channelName,
    );
  } catch {
    await interaction.reply({
      content:
        "Failed to create channel. Make sure the bot has permission to manage channels.",
      flags: "Ephemeral",
    });
  }
}
