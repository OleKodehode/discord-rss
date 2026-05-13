import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from "dotenv";
import { JsonAdapter } from "./db/json.js";
import { startScheduler } from "./scheduler/index.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";

dotenv.config();

// Command Imports - Should dynamically add in any command added to "commands"
const commands = new Map();
const commandFiles = readdirSync(join(process.cwd(), "src/commands")).filter(
  (file) => file.endsWith(".ts") && file !== "helpers.ts",
); // Exclude helper script

for (const file of commandFiles) {
  const command = await import(`./commands/${file.replace(".ts", ".js")}`);
  commands.set(command.data.name, command);
}

const discordToken = process.env.DISCORD_TOKEN;
const clientID = process.env.CLIENT_ID;

async function main() {
  // check if token and ID has been set
  if (!discordToken || !clientID) {
    console.error(`${discordToken ? "" : "DISCORD_TOKEN missing in .env file!"}
      ${clientID ? "" : "CLIENT_ID missing from .env file!"}`);
    return;
  }
  // We need the intents for slash commands and channel operations.
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("clientReady", (c) => {
    console.log(`Logged in as ${c.user.tag}`);
  });

  // JSON Init
  const jsonDB = new JsonAdapter();
  try {
    await jsonDB.init();
  } catch (error) {
    console.error(
      `Something went wrong when trying to initialize json DB:\n${error}`,
    );
    return;
  }

  // Send commands to discord REST
  // Check for discord token is done at the start, should be safe to assume it's of string.
  const rest = new REST().setToken(discordToken!);

  const commandData = [...commands.values()].map((cmd) => cmd.data.toJSON());

  try {
    await rest.put(Routes.applicationCommands(clientID!), {
      body: commandData,
    });
  } catch (error) {
    console.error(`Something went wrong while trying to register commands with discord:
    ${error}`);
    return;
  }

  console.log("Commands registered.");

  // Setup of event handler for interactionCreate
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, jsonDB);
    } catch (error) {
      await interaction.reply({
        content: "Something went wrong.",
        flags: "Ephemeral",
      });
    }
  });
  // Start scheduler
  try {
    startScheduler(client, jsonDB);
  } catch (error) {
    console.error(
      `Something went wrong when trying to start scheduler:\n${error}`,
    );
    return;
  }

  await client.login(discordToken);
}

main().catch(console.error);
