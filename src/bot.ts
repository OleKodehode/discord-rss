import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

// We need the intents for slash commands and channel operations.
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("clientReady", (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
