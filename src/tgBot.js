import request from 'request-promise'
import gm from 'gm'

const im = gm.subClass({ imageMagick: true });

import socksAgent from '../proxyConf'

const getFile = async url => {
    return await request({url, encoding: null, agent: socksAgent}, (err, resp, buffer) => {
        return buffer;
   });
}

const tgActions = (tg,vk) => {

    tg.command('info', (context) => {
        if(context.chat.id.toString() === process.env.TG_CHAT_ID){
            context.reply(`Это бот для коммуникации между конфой в тг и вк.`); 
        }
    });

    tg.on('message', async (context) => {
        if(context.chat.id.toString() === process.env.TG_CHAT_ID){
            switch(context.updateSubTypes[0]){
                case 'text' : {
                    const message = `${context.from.first_name} ${context.from.last_name}\n${context.message.text}`;
                    vk.api.messages.send(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            message: message
                        });
                    break 
                }
                case 'sticker' : {
                    const fileId = context.message.sticker.file_id
                    const link = await tg.telegram.getFileLink(fileId);
                    const imagewebp = await getFile(link);
                    im(imagewebp, 'sticker.WEBP').toBuffer('image.PNG',async (err, buffer) => {
                        if (err) console.error(err);
                        const message = `${context.from.first_name} ${context.from.last_name}\nприслал стикер:`;
                        const attachment = await vk.upload.messagePhoto(
                            {
                                peer_id: process.env.VK_CHAT_ID, 
                                source: buffer
                            });
                        vk.api.messages.send(
                            {
                                peer_id: process.env.VK_CHAT_ID, 
                                message: message,
                                attachment: attachment
                            });
                    });
                    break 
                }
                case 'audio' : {
                    const fileId = context.message.audio.file_id;
                    const link = await tg.telegram.getFileLink(fileId);
                    const audio = await getFile(link);
                    const message = `${context.from.first_name} ${context.from.last_name}\nприслал аудио:`;
                    const attachment = await vk.upload.audioMessage(
                        {
                            peer_id: process.env.VK_CHAT_ID,
                            source: audio
                        });
                    vk.api.messages.send(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            message: message,
                            attachment: attachment
                        });
                    break 
                }
                case 'voice' : {
                    const fileId = context.update.message.voice.file_id;
                    const link = await tg.telegram.getFileLink(fileId);
                    const voice = await getFile(link);
                    const message = `${context.from.first_name} ${context.from.last_name}\nприслал войс:`;
                    const attachment = await vk.upload.audioMessage(
                        {
                            peer_id: process.env.VK_CHAT_ID,
                            source: voice
                        });
                    vk.api.messages.send(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            message: message,
                            attachment: attachment
                        });
                    break 
                }
                case 'photo' : {
                    const fileId = context.update.message.photo[2].file_id;
                    const link = await tg.telegram.getFileLink(fileId);
                    const photo = await getFile(link);
                    const message = `${context.from.first_name} ${context.from.last_name}\nприслал:`;
                    const attachment = await vk.upload.messagePhoto(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            source: photo
                        });
                    vk.api.messages.send(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            message: message,
                            attachment: attachment
                        });
                    break 
                }
                case 'document' : {
                    const fileId = context.update.message.document.file_id;
                    const link = await tg.telegram.getFileLink(fileId);
                    const document = await getFile(link);
                    const message = `${context.from.first_name} ${context.from.last_name}\nприслал:`;
                    const attachment = await vk.upload.messageDocument(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            source: document
                        });
                    vk.api.messages.send(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            message: message,
                            attachment: attachment
                        });
                    break 
                }
                case 'video' : {
                    const message = `${context.from.first_name} ${context.from.last_name}\nприслал видео, но оно не поддерживается.`;
                    vk.api.messages.send(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            message: message
                        });
                    break 
                }
                default : {
                    console.log(`Необрабатываемый тип ${context.updateSubTypes[0]}`);
                    const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\nПрислал необрабатываемый тип ${context.updateSubTypes[0]}`;
                    vk.api.messages.send(
                        {
                            peer_id: process.env.VK_CHAT_ID, 
                            message: message
                        });
                    break
                }
            }
        }
    });

    //Нереализуемо без хранения сообщений.
    /*
    tg.on('edited_message', async (context) => {
        if(context.chat.id.toString() === process.env.TG_CHAT_ID){
            console.log(context);
            const message = `Сообщение было изменено на:\n${context.message.text}`;
            const oldmessage = vk.api.messages.search({
                q:context.message.text,
                peer_id: process.env.VK_CHAT_ID,
                count: 1
            });
            console.log(oldmessage);
            /*
            vk.api.messages.send(
                {
                    peer_id: process.env.VK_CHAT_ID, 
                    message: message
                })
            
        }
    });
    */
}

export {tgActions};