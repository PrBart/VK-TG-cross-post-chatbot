import {} from 'dotenv/config'
import VkBot from 'vk-io'
import Telegraf from 'telegraf'

import socksAgent from './proxyConf'

import {vkActions} from './src/vkBot'
import {tgActions} from './src/tgBot'

const vk = new VkBot({
	token: process.env.VK_BOT_TOKEN,
	pollingGroupId: process.env.VK_GROUPBOT_ID
});

const tg = new Telegraf(process.env.TG_BOT_TOKEN,{
	telegram: { agent: socksAgent }
});

vkActions(vk, tg);
tgActions(tg, vk);

vk.updates.start(console.log('Vk bot started')).catch((err) => {
	console.log('VK_ERROR', err);
});

tg.launch(console.log('Tg bot started')).catch((err) => {
	console.log('TG_ERROR', err);
});