# Casino Bot - Setup Guide

## Bot Description

This Discord casino bot allows users to participate in various gambling games within a Discord server. It is developed in JavaScript using the `discord.js` library and connects to a MongoDB database to store relevant information.

## Prerequisites

Before setting up the bot, make sure you have the following components installed:

- **Node.js**: Version 14 or higher.
- **npm**: Node.js package manager.
- **MongoDB**: A running instance of MongoDB to store the bot’s data.

## Installation

Follow these steps to install and configure the bot:

### 1. Clone the repository

```bash
git clone https://github.com/PARJOAC/CASINOBOT.git
```

### 2. Navigate to the bot directory

```bash
cd CASINOBOT
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root of the project and define the following variables:

```env
#BOT
BOT_ID=your_bot_id
BOT_TOKEN=your_bot_token
XP_LEVEL=xp_required_per_level
OWNER_ID=your_user_id

#DATABASE
MONGODB=your_mongodb_uri

#GUILD
GUILD_ID=your_guild_id

#CHANNELS
LOG_CHANNEL_GUILD_ADD=log_channel_guild_add_id
LOG_CHANNEL_GUILD_DELETE=log_channel_guild_delete_id
VOICE_CHANNEL_MUSIC=voice_channel_music_id
MAINTENANCE_CHANNEL_ID=maintenance_channel_id
SUGGEST_CHANNEL_ID=suggestions_channel_id

#LOGS
LOCAL_LOG_GAMES_CHANNEL_ID=local_log_games_channel_id
LOCAL_LOG_VOTES_CHANNEL_ID=local_log_votes_channel_id
LOCAL_LOG_COMMANDS_CHANNEL_ID=local_log_commands_channel_id

GLOBAL_LOG_COMMANDS_CHANNEL_ID=global_log_commands_channel_id
GLOBAL_LOG_VOTES_CHANNEL_ID=global_log_votes_channel_id
GLOBAL_LOG_GAMES_CHANNEL_ID=global_log_games_channel_id

#COLORS
RED_COLOR=hexadecimal_color_red
GREEN_COLOR=hexadecimal_color_green
BLUE_COLOR=hexadecimal_color_blue
YELLOW_COLOR=hexadecimal_color_yellow

#TOPGG
TOPGG_API_TOKEN=your_topgg_api_token
```

#### **How to Obtain the Required Values:**

- **BOT_ID**: Go to the [Discord Developer Portal](https://discord.com/developers/applications), select your application, and copy the ID.
- **BOT_TOKEN**: In the same portal, go to the "Bot" section of your application, create a bot (if you haven’t already), and copy the access token.
- **GUILD_ID**: Open Discord, right-click on your server’s name, and select "Copy ID" (you need to enable "Developer Mode" in Discord settings if you don’t see this option).
- **OWNER_ID**: Copy your Discord user ID.
- **XP_LEVEL**: Choose a value for the XP level. This value will be used to determine when a user reaches the next level.
- **MONGODB**: Create a database in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or use a local instance. Copy the connection URI provided by MongoDB.
- **LOG_CHANNEL_GUILD_ADD**, **LOG_CHANNEL_GUILD_DELETE**, **LOCAL_LOG_GAMES_CHANNEL_ID**, **LOCAL_LOG_VOTES_CHANNEL_ID**, **LOCAL_LOG_COMMANDS_CHANNEL_ID**, **GLOBAL_LOG_COMMANDS_CHANNEL_ID**, **GLOBAL_LOG_VOTES_CHANNEL_ID**, **GLOBAL_LOG_GAMES_CHANNEL_ID**, **VOICE_CHANNEL_MUSIC**, **MAINTENANCE_CHANNEL_ID**, **SUGGEST_CHANNEL_ID**: In Discord, right-click on the desired channel and select "Copy ID".
- **RED_COLOR**, **GREEN_COLOR**, **BLUE_COLOR**, **YELLOW_COLOR**: These are color codes in hexadecimal format. You can find them using online color pickers.
- **TOPGG_API_TOKEN**: If you plan to use integrations with [top.gg](https://top.gg/), register and generate an API token in your user dashboard.

Make sure to replace each value with the corresponding information for your setup.

### 5. Start the bot

```bash
node index.js
```

## Usage

Once the bot is running and added to your Discord server, users can interact with it through specific commands to participate in the available casino games.

## Additional Notes

- Keep your tokens and MongoDB URI secure and do not share them publicly.
- Review the official `discord.js` documentation to better understand how to interact with the Discord API.
- If you encounter issues or errors, check the logs in the configured log channels for more details.

For more details and updates, visit the project’s official repository: [https://github.com/PARJOAC/CASINOBOT](https://github.com/PARJOAC/CASINOBOT).
