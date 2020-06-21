import toEscapeMsg from './helper.js';
import Telegraf, { Extra, TContext } from 'telegraf';
import VK, {
  MessageContext,
  PhotoAttachment,
  AudioAttachment,
  AudioMessageAttachment,
  StickerAttachment,
  LinkAttachment,
} from 'vk-io';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

type MergedAttachments = PhotoAttachment &
  AudioAttachment &
  AudioMessageAttachment &
  StickerAttachment &
  LinkAttachment;

const vkActions = (vk: VK, tg: Telegraf<TContext>): void => {
  const parseMode: ExtraReplyMessage = { parse_mode: 'Markdown' };

  const handleError = async (
    context: MessageContext,
    fullName: string,
    err: any,
  ) => {
    const message = `*${fullName}* \n*поймал ошибку*\n${err.message}.`;
    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
  };

  vk.updates.hear('/info', async context => {
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
      if (context.text !== null) {
        try {
          const content = toEscapeMsg(context.text);
          const message = `*${fullName}*\n${content}`;
          tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
        } catch (err) {
          handleError(context, fullName, err);
        }
      }
      if (context.hasAttachments() === true) {
        context.attachments.map(async (att: MergedAttachments) => {
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
                const message = `*${fullName}*\n${toEscapeMsg(att.largePhoto)}`;
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
                const track =
                  toEscapeMsg(att.artist) + ' - ' + toEscapeMsg(att.title);
                const message = `*${fullName}*\n*прислал трек:\n*${track}\n(мб потом прикручу прогрузку треков в вк)`;
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
                const message = `*${fullName}*\n*прислал войс:*`;
                tg.telegram.sendMessage(
                  process.env.TG_CHAT_ID,
                  message,
                  parseMode,
                );
                tg.telegram.sendVoice(process.env.TG_CHAT_ID, att.oggUrl);
              } catch (err) {
                handleError(context, fullName, err);
              }
              break;
            }
            case 'doc': {
              try {
                const title = toEscapeMsg(att.title);
                const url = toEscapeMsg(att.url);
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
                const length = (context.attachments as StickerAttachment[])[0]
                  .images.length;
                const url = toEscapeMsg(
                  (context.attachments as StickerAttachment[])[0].images[
                    length - 1
                  ].url,
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
                const url = toEscapeMsg(
                  (context.attachments as LinkAttachment[])[0].url,
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
            default: {
              try {
                console.log(att.type);
                const message = `*${fullName}*\n*прислал какую-то хуйню формата:* ${att.type}`;
                console.log(context);
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

export { vkActions };
