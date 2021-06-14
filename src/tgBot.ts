import dotenv from 'dotenv';

import request from 'request-promise';
import gm from 'gm';
import ffmpeg from 'fluent-ffmpeg';
import { VK } from 'vk-io';
import Telegraf, { TContext } from 'telegraf';
import socksAgent from './proxyConf';

dotenv.config();

const vkChatId = parseInt(process.env.VK_CHAT_ID, 10);

const im = gm.subClass({ imageMagick: true });

const getFile = async (url: string): Promise<Buffer> =>
  request(
    {
      url,
      encoding: null,
      agent: parseInt(process.env.ENABLE_PROXY, 10) ? socksAgent : null,
    },
    (err, resp, buffer) => buffer,
  );

const tgActions = (tg: Telegraf<TContext>, vk: VK): void => {
  const handleError = async (
    context: TContext,
    fullName: string,
    err: Error,
  ) => {
    const message = `${fullName}\nпоймал ошибку\n${err.message}.`;
    vk.api.messages.send({
      peer_id: vkChatId,
      random_id: context.message.message_id,
      message,
    });
  };

  tg.command('info', context => {
    if (context.chat.id.toString() === process.env.TG_CHAT_ID) {
      context.reply('Это бот для коммуникации между конфой в тг и вк.');
    }
  });

  tg.on('message', async context => {
    if (context.chat.id.toString() === process.env.TG_CHAT_ID) {
      const fullName = `${
        context.from.first_name ? context.from.first_name : ''
      } ${context.from.last_name ? context.from.last_name : ''}`;
      switch (context.updateSubTypes[0]) {
        case 'text': {
          try {
            const message = `${fullName}\n${context.message.text}`;
            vk.api.messages.send({
              peer_id: vkChatId,
              random_id: context.message.message_id,
              message,
            });
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
        case 'sticker': {
          try {
            const fileId = context.message.sticker.file_id;
            const link = await tg.telegram.getFileLink(fileId);
            const imagewebp = await getFile(link);
            switch (context.message.sticker.is_animated) {
              case false: {
                im(imagewebp, 'sticker.WEBP').toBuffer(
                  'image.PNG',
                  async (_err, buffer) => {
                    const message = `${fullName}\nприслал стикер:`;
                    const attachment = await vk.upload.messagePhoto({
                      peer_id: vkChatId,
                      source: { value: buffer },
                    });
                    vk.api.messages.send({
                      peer_id: vkChatId,
                      random_id: context.message.message_id,
                      message,
                      attachment: attachment.toString(),
                    });
                  },
                );
                break;
              }
              default: {
                const message = `${fullName}\nприслал анимированный стикер:\n анимированные стикеры, пока не поддерживаются`;
                vk.api.messages.send({
                  peer_id: vkChatId,
                  random_id: context.message.message_id,
                  message,
                });
                break;
              }
            }
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
        case 'audio': {
          try {
            const fileId = context.message.audio.file_id;
            const link = await tg.telegram.getFileLink(fileId);
            const audio = await getFile(link);
            const message = `${fullName}\nприслал аудио:`;
            const attachment = await vk.upload.audioMessage({
              peer_id: vkChatId,
              source: { value: audio },
            });
            vk.api.messages.send({
              peer_id: vkChatId,
              random_id: context.message.message_id,
              message,
              attachment: attachment.toString(),
            });
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
        case 'voice': {
          try {
            const fileId = context.update.message.voice.file_id;
            const link = await tg.telegram.getFileLink(fileId);
            const voice = await getFile(link);
            const message = `${fullName}\nприслал войс:`;
            const attachment = await vk.upload.audioMessage({
              peer_id: vkChatId,
              source: { value: voice },
            });
            vk.api.messages.send({
              peer_id: vkChatId,
              random_id: context.message.message_id,
              message,
              attachment: attachment.toString(),
            });
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
        case 'photo': {
          try {
            const { length } = context.update.message.photo;
            const fileId = context.update.message.photo[length - 1].file_id;
            const link = await tg.telegram.getFileLink(fileId);
            const photo = await getFile(link);
            const { caption } = context.update.message;
            const message = `${fullName}\nприслал:\n ${caption || ''}`;
            const attachment = await vk.upload.messagePhoto({
              peer_id: vkChatId,
              source: { value: photo },
            });
            vk.api.messages.send({
              peer_id: vkChatId,
              random_id: context.message.message_id,
              message,
              attachment: attachment.toString(),
            });
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
        case 'document': {
          try {
            const fileId = context.update.message.document.file_id;
            const link = await tg.telegram.getFileLink(fileId);
            const document = await getFile(link);
            const message = `${fullName}\nприслал:`;
            const attachment = await vk.upload.messageDocument({
              peer_id: vkChatId,
              source: { value: document },
            });
            vk.api.messages.send({
              peer_id: vkChatId,
              random_id: context.message.message_id,
              message,
              attachment: attachment.toString(),
            });
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
        case 'video': {
          try {
            const fileId = context.update.message.video.file_id;
            const link = await tg.telegram.getFileLink(fileId);
            const message = `${fullName}\nприслал видео\nлинк:${link}.`;
            vk.api.messages.send({
              peer_id: vkChatId,
              random_id: context.message.message_id,
              message,
            });
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
        case 'animation': {
          try {
            const fileId = context.update.message.animation.file_id;
            const link = await tg.telegram.getFileLink(fileId);
            let buffer = Buffer.alloc(0);
            await ffmpeg(link)
              .outputOption('-vf', 'scale=320:-1:flags=lanczos,fps=15')
              .format('gif')
              .on('data', (chunk: Buffer) => {
                buffer = Buffer.concat([buffer, chunk]);
              })
              .on('end', async () => {
                const message = `${fullName}\nПрислал гифку`;
                const attachment = await vk.upload.messageDocument({
                  peer_id: vkChatId,
                  source: { value: buffer },
                });
                vk.api.messages.send({
                  peer_id: vkChatId,
                  random_id: context.message.message_id,
                  message,
                  attachment: attachment.toString(),
                });
              });
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
        default: {
          // eslint-disable-next-line no-console
          console.log(`Необрабатываемый тип ${context.updateSubTypes[0]}`);
          try {
            const message = `${fullName}\nПрислал необрабатываемый тип ${context.updateSubTypes[0]}`;
            vk.api.messages.send({
              peer_id: vkChatId,
              random_id: context.message.message_id,
              message,
            });
          } catch (err) {
            handleError(context, fullName, err);
          }
          break;
        }
      }
    }
  });
};

export default tgActions;
