import Telegraf, { TContext } from 'telegraf';
import {
  VK,
  MessageContext,
  PhotoAttachment,
  AudioAttachment,
  AudioMessageAttachment,
  StickerAttachment,
  LinkAttachment,
  DocumentAttachment,
  Attachment,
} from 'vk-io';
import { HearManager } from '@vk-io/hear';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import toEscapeMsg from './helper.js';

const hearManager = new HearManager<MessageContext>();
const vkActions = (vk: VK, tg: Telegraf<TContext>): void => {
  const parseMode: ExtraReplyMessage = { parse_mode: 'Markdown' };

  const handleError = async (
    context: MessageContext,
    fullName: string,
    err: Error,
  ) => {
    const message = `*${fullName}* \n*поймал ошибку*\n${err.message}.`;
    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
  };

  hearManager.hear('/info', async context => {
    if (
      context.peerId.toString() === process.env.VK_CHAT_ID &&
      context.isUser
    ) {
      const inviteLink = await tg.telegram.exportChatInviteLink(
        process.env.TG_CHAT_ID,
      );
      await context.send(
        `Это бот для коммуникации между конфой в тг и вк.
        Линк на конфу ТГ: ${inviteLink}`,
      );
    }
  });

  vk.updates.on('message_new', hearManager.middleware);

  vk.updates.on('message', async (context, next) => {
    if (
      context.peerId.toString() === process.env.VK_CHAT_ID &&
      context.isUser
    ) {
      const vkUser = await vk.api.users.get({
        user_ids: context.senderId.toString(),
      });
      const fullName = `${vkUser[0].first_name ? vkUser[0].first_name : ''} ${
        vkUser[0].last_name ? vkUser[0].last_name : ''
      }`;
      if (context.text) {
        try {
          const content = toEscapeMsg(context.text);
          const message = `*${fullName}*\n${content}`;
          tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
        } catch (err) {
          handleError(context, fullName, err);
        }
      }
      if (context.hasAttachments() === true) {
        context.attachments.map(async (att: Attachment) => {
          switch (att.type) {
            case 'wall': {
              try {
                const url = toEscapeMsg(att.toString());
                const message = `*${fullName}* \nvk.com/feed?w=${url}`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            case 'photo': {
              try {
                const photoAttachment = att.toJSON() as PhotoAttachment;
                const message = `*${fullName}*\n${toEscapeMsg(
                  photoAttachment.largeSizeUrl,
                )}`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            case 'audio': {
              try {
                const audioAttachment = att.toJSON() as AudioAttachment;
                const audioName = `${toEscapeMsg(
                  audioAttachment.artist,
                )} - ${toEscapeMsg(audioAttachment.title)}`;
                const message = `*${fullName}*\n*прислал трек:\n*${audioName}\n(мб потом прикручу прогрузку треков в вк)`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            case 'audio_message': {
              try {
                const audioMessageAttachment =
                  att.toJSON() as AudioMessageAttachment;
                const message = `*${fullName}*\n*прислал войс:*`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
                tg.telegram.sendVoice(
                  process.env.TG_CHAT_ID,
                  audioMessageAttachment.oggUrl,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            case 'doc': {
              try {
                const documentAttachment = att.toJSON() as DocumentAttachment;
                const title = toEscapeMsg(documentAttachment.title);
                const url = toEscapeMsg(documentAttachment.url);
                const message = `*${fullName}*\n*прислал Док:*${title}\n*линк:*${url}`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            case 'video': {
              try {
                const url = toEscapeMsg(att.toString());
                const message = `*${fullName}*\n*отправил видео*\nhttps://vk.com/im?z=${url}`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            case 'sticker': {
              try {
                const stickerAttachment = att.toJSON() as StickerAttachment;
                const url = toEscapeMsg(
                  stickerAttachment.images[stickerAttachment.images.length - 1]
                    .url,
                );
                const message = `*${fullName}*\n${url}`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            case 'link': {
              try {
                const linkAttachment = att.toJSON() as LinkAttachment;
                const url = toEscapeMsg(linkAttachment.url);
                const message = `*${fullName}*\n${url}`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            default: {
              try {
                const message = `*${fullName}*\n*прислал необрабатываемый формата:* ${att.type}`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
          }
        });
      }
    }
    next();
  });
};

export default vkActions;
