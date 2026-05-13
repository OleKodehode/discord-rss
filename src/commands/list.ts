import type { ChatInputCommandInteraction } from "discord.js";
import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import type { DbAdapter } from "../db/adapter.js";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription(
    "List the different RSS feeds associated with this discord server",
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(
  interaction: ChatInputCommandInteraction,
  db: DbAdapter,
) {
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      flags: "Ephemeral",
    });
    return;
  }

  const subscriptions = await db.getSubscriptionByGuild(guildId);

  if (subscriptions.length < 1) {
    await interaction.reply({
      content: "No subscriptions to list.",
      flags: "Ephemeral",
    });
    return;
  }

  const embed = new EmbedBuilder();

  embed.setTitle("📰 RSS Feeds for this server");
  for (const sub of subscriptions) {
    embed.addFields({
      name: `<#${sub.channelId}>`,
      value: `URL: ${sub.feedUrl}\nInterval: ${sub.interval} minutes\nFilter: ${sub.filter.length ? sub.filter.join(", ") : "none"}`,
    });
  }

  await interaction.reply({ embeds: [embed], flags: "Ephemeral" });
}
