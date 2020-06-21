import * as TT from 'telegram-typings';
import { IncomingMessage } from 'telegraf/typings/telegram-types';
import { TelegrafContext } from 'telegraf/typings/context';

declare module 'telegraf' {
  interface TContext extends TelegrafContext {
    message: RefinedIncomingMessage;
    update: RefinedUpdate;
  }

  interface RefinedIncomingMessage extends IncomingMessage {
    sticker: RefinedSticker;
  }

  interface RefinedSticker extends TT.Sticker {
    is_animated: boolean;
  }

  interface RefinedUpdate extends TT.Update {
    message?: RefinedMessage;
  }

  interface RefinedMessage extends TT.Message {
    animation: TT.Animation;
  }
}
