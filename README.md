# Discord RSS bot

a self-hosted Discord bot written with TS that monitors RSS feeds and posts updates to your channel of choice.

## Features

- Subscribe channels to RSS feeds with configurable polling intervals
- Filter feed items by keywords (comma separated list)
- Supports multiple servers (goes by guildID and channelID)
- JSON Database included (Proof of concept - see limitations)

## Setup

### Requirements

- Node.js 18+
- A Discord bot token ([discord.com/developers](https://discord.com/developers))

### Installation

1. Clone this repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Run `npm run dev`

### Environment Variables

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
```

You'll find the application ID under `Overview - General Info` on your bot's developer portal. You can find your token under `Overview - Bot` - Though you might have to reset the token if you didn't copy it the first time you visited the page.

## Commands

| Command           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `/subscribe`      | Subscribe this channel to an RSS feed                  |
| `/create-channel` | Create a new channel and subscribe it to an RSS feed   |
| `/unsubscribe`    | Remove a subscription, optionally deleting the channel |
| `/list`           | List all RSS feeds for this server                     |

## Limitation

If the RSS feed you want to monitor is particularly active, it might end up missing items, due to polling only returning a certain amount of recent items.
This is a known limitation to RSS.
You can compensate by changing the feedinterval in the code, but I've set it to 15/30/60 minutes to limit the amount of polling it does, to avoid any potential rate limits and such.
if you do change it, be reasonable.

Additionally, the bot won't immediately send the latest RSS update after subscribing to a new RSS feed. It's something I noticed too late unfortunately.

## Expanding the bot

You can freely expand the bot with new functionality as you see fit. This bot is free to use, it was done as a last small project during my stay at `Kodehode` web developer course here in Norway.

- To add a new database backend, Implement the `DbAdapter` interface in `src/db/`
- To add new commands, add a file to `src/commands/` - it will be loaded automatically. (Done at the start of `bot.ts`)
- To add or change the polling intervales, update the `FEED_INTERVALS` in `src/types.ts`. You shouldn't have to change any values anywhere else.
