import toEscapeMsg from './helper.js';

const vkActions = (vk,tg) => {

    const parseMode = {parse_mode:'markdown'};
    
    const handleError = async (context, vkUser, err) => {
        console.log(err);
        const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}* \n*поймал ошибку*\n${err}.`;
        tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
    };
	
    vk.updates.hear('/info', async (context) => {
        if(context.peerId.toString() === process.env.VK_CHAT_ID && context.isUser){
            const inviteLink = await tg.telegram.exportChatInviteLink(process.env.TG_CHAT_ID);
            await context.send(
                `Это бот для коммуникации между конфой в тг и вк.
				Линк на конфу ТГ: ${inviteLink}`
            );
        }
    });

    vk.updates.on('message', async (context, next) => {
        if(context.peerId.toString() === process.env.VK_CHAT_ID && context.isUser){
            const vkUser = await vk.api.users.get({user_ids: context.senderId});
            switch(context.hasAttachments()) {
                case true: 
                    context.attachments.map(async att => {
                        switch(att.type){
                            case 'wall' : {
                                try {
                                    const url = toEscapeMsg(att.toString());
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}* \nvk.com/feed?w=${url}`;
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;             
                                }
                            }
                            case 'photo' : {
                                try {
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n${att.largePhoto}`;
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;             
                                }
                            }
                            case 'audio' :{
                                try {
                                    const track = toEscapeMsg(att.artist) + ' - ' + toEscapeMsg(att.title);
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n*прислал трек:\n*${track}\n(мб потом прикручу прогрузку треков в вк)`;
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;             
                                }
                            }
                            case 'audio_message' : {
                                try {
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n*прислал войс:*`;
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    tg.telegram.sendVoice(process.env.TG_CHAT_ID, att.oggUrl);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;             
                                }
                            }
                            case 'doc' : {
                                try {
                                    const title = toEscapeMsg(att.title);
                                    const url = toEscapeMsg(att.url);
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n*прислал Док:*${title}\n*линк:*${url}`;
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;             
                                }
                            }
                            case 'video' : {
                                try {
                                    const url = toEscapeMsg(att.toString());
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n*отправил видео*\nhttps://vk.com/im?z=${url}`;
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;
                                }
                            }
                            case 'sticker' : {
                                try {
                                    const length = context.attachments[0].images.length;
                                    const url = toEscapeMsg(context.attachments[0].images[length - 1].url);
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n${url}`;
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;             
                                }
                            }
                            case 'link' : {
                                try {
                                    const url = toEscapeMsg(context.attachments[0].url);
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n${url}`;
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;             
                                }
                            }
                            default : {
                                try {
                                    console.log(att.type);
                                    const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n*прислал какую-то хуйню формата:* ${att.type}`;
                                    console.log(context);
                                    tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                                    break;
                                } catch (err) {
                                    handleError(context, vkUser, err);
                                    break;             
                                }
                            }
                        }
                    });
                    break;
                default:
                    if(context.text !== null){
                        try {
                            const content = toEscapeMsg(context.text);
                            const message = `*${vkUser[0].first_name} ${vkUser[0].last_name}*\n${content}`;
                            tg.telegram.sendMessage(process.env.TG_CHAT_ID, message, parseMode);
                        } catch (err) {
                            handleError(context, vkUser, err);
                            break;             
                        }
                    }
            }
        }
        next();
    });

    //Это говно поломано в АПИ, разраб особо не хочет чинить.
    /*
	vk.updates.on(['edit_message'], async (context, next) => {
		console.log('edited!!');
        if(context.peerId.toString() === process.env.VK_CHAT_ID && context.isUser){
            console.log('edited!!');
        }
        next()
	});
	*/
};

export {vkActions};