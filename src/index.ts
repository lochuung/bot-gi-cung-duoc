import { MezonClient } from "mezon-sdk";
import * as dotenv from 'dotenv';
import { SessionManager } from "mezon-sdk/dist/cjs/mezon-client/manager/session_manager";

// Load environment variables
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN ?? '';

const client = new MezonClient(BOT_TOKEN);


client.login().then(() => {
    console.log('Bot is logged in successfully!');
    process.exit(0);
}).catch((error) => {
    console.error('Failed to log in:', error);
});