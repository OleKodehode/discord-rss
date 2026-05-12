import type { ChatInputCommandInteraction } from "discord.js";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { DbAdapter } from "../db/adapter.js";

export const data = new SlashCommandBuilder()
  .setName("unsubscribe")
  .setDescription("Unsubscribe from one of your RSS Feeds")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Which feed to unsubscribe from (linked to channel)")
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName("delete-channel")
      .setDescription("Should the channel be deleted?")
      .setRequired(true),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  db: DbAdapter,
) {
  const channel = interaction.options.getChannel("channel", true);
  const toDelete = interaction.options.getBoolean("delete-channel");

  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      flags: "Ephemeral",
    });
    return;
  }

  const fullChannel = await interaction.guild!.channels.fetch(channel.id);
  if (!fullChannel) {
    await interaction.reply({
      content: "Channel not found",
      flags: "Ephemeral",
    });
    return;
  }

  const subscriptions = await db.getSubscriptionByGuild(guildId);
  const subscription = subscriptions.find(
    (entry) => entry.channelId === channel.id,
  );

  if (!subscription) {
    await interaction.reply({
      content: "No subscription found for that channel.",
      flags: "Ephemeral",
    });
    return;
  }

  await db.removeSubscription(subscription.id);

  if (toDelete) await fullChannel?.delete();

  await interaction.reply({
    content: `I've unsubscribed ${subscription.feedUrl} from <#${channel.id}>. ${toDelete ? "The channel has been deleted." : ""}`,
  });
}
