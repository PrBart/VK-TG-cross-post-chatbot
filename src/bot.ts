import { VK } from 'vk-io';
import Telegraf, { TContext } from 'telegraf';

import socksAgent from './proxyConf';

import vkActions from './vkBot';
import tgActions from './tgBot';

const vk = new VK({
  token: process.env.VK_BOT_TOKEN,
  pollingGroupId: parseInt(process.env.VK_GROUPBOT_ID, 10),
});

const tg = new Telegraf(process.env.TG_BOT_TOKEN, {
  telegram: {
    agent: parseInt(process.env.ENABLE_PROXY, 10) ? socksAgent : null,
  },
}) as Telegraf<TContext>;

vkActions(vk, tg);
tgActions(tg, vk);

vk.updates
  .start()
  .then(() => console.log('vk bot started'))
  .catch(err => {
    console.log('VK_ERROR', new Date(), err);
  });

tg.launch()
  .then(() => console.log('tg bot started'))
  .catch(err => {
    console.log('TG_ERROR', new Date(), err);
  });
