import request from 'request-promise';
import gm from 'gm';
import ffmpeg from 'fluent-ffmpeg'; 

const im = gm.subClass({ imageMagick: true });

import socksAgent from '../proxyConf';

const getFile = async url => {
    return request({url, encoding: null, agent: socksAgent}, (err, resp, buffer) => {
        return buffer;
    });
};

const tgActions = (tg,vk) => {

    const handleError = async (context, fullName, err) => {
        const message = `${fullName}\nпоймал ошибку\n${err.message}.`;
        vk.api.messages.send(
            {
                peer_id: process.env.VK_CHAT_ID, 
                message: message
            });
    };

    tg.command('info', (context) => {
        if(context.chat.id.toString() === process.env.TG_CHAT_ID){
            context.reply('Это бот для коммуникации между конфой в тг и вк.'); 
        }
    });

    tg.on('message', async (context) => {
        if(context.chat.id.toString() === process.env.TG_CHAT_ID){
            const fullName = `${context.from.first_name ? context.from.first_name : ''} ${context.from.last_name ? context.from.last_name : ''}`;
            switch(context.updateSubTypes[0]){
                case 'text' : {
                    try{
                        const message = `${fullName}\n${context.message.text}`;
                        vk.api.messages.send(
                            {
                                peer_id: process.env.VK_CHAT_ID, 
                                message: message
                            }); 
                    } catch (err) {
                        handleError(context, fullName, err);             
                    }
                    break;
                }
                case 'sticker' : {
                    try {
                        const fileId = context.message.sticker.file_id;
                        const link = await tg.telegram.getFileLink(fileId);
                        const imagewebp = await getFile(link);
                        switch(context.message.sticker.is_animated) {
                            case true : {
                                const message = `${fullName}\nприслал анимированный стикер:\n анимированные стикеры, пока не поддерживаются`;
                                vk.api.messages.send(
                                    {
                                        peer_id: process.env.VK_CHAT_ID, 
                                        message: message
                                    }); 
                                break;
                            }
                            case false : {
                                im(imagewebp, 'sticker.WEBP').toBuffer('image.PNG',async (err, buffer) => {
                                    if (err) console.error(`ERROR: ${err}`);
                                    const message = `${fullName}\nприслал стикер:`;
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
                                break;
                            }
                        }
                    } catch (err) {
                        handleError(context, fullName, err);             
                    }
                    break; 
                }
                case 'audio' : {
                    try {
                        const fileId = context.message.audio.file_id;
                        const link = await tg.telegram.getFileLink(fileId);
                        const audio = await getFile(link);
                        const message = `${fullName}\nприслал аудио:`;
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
                    } catch (err) {
                        handleError(context, fullName, err);             
                    }
                    break; 
                }
                case 'voice' : {
                    try {
                        const fileId = context.update.message.voice.file_id;
                        const link = await tg.telegram.getFileLink(fileId);
                        const voice = await getFile(link);
                        const message = `${fullName}\nприслал войс:`;
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
                    } catch (err) {
                        handleError(context, fullName, err);             
                    }
                    break; 
                }
                case 'photo' : {
                    try {
                        const length = context.update.message.photo.length;
                        const fileId = context.update.message.photo[length - 1].file_id;
                        const link = await tg.telegram.getFileLink(fileId);
                        const photo = await getFile(link);
                        const caption = context.update.message.caption;
                        const message = `${fullName}\nприслал:\n ${caption ? caption : ''}`;
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
                    } catch (err) {
                        handleError(context, fullName, err);             
                    }
                    break; 
                }
                case 'document' : {
                    try {
                        const fileId = context.update.message.document.file_id;
                        const link = await tg.telegram.getFileLink(fileId);
                        const document = await getFile(link);
                        const message = `${fullName}\nприслал:`;
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
                    } catch (err) {
                        handleError(context, fullName, err);             
                    }
                    break; 
                }
                case 'video' : {
                    try {
                        const fileId = context.update.message.video.file_id;
                        const link = await tg.telegram.getFileLink(fileId);
                        const message = `${fullName}\nприслал видео\nлинк:${link}.`;
                        vk.api.messages.send(
                            {
                                peer_id: process.env.VK_CHAT_ID, 
                                message: message
                            }); 
                    } catch (err) {
                        handleError(context, fullName, err);             
                    }
                    break; 
                }
                case 'animation' : {
                    try {
                        const fileId = context.update.message.animation.file_id;
                        const link = await tg.telegram.getFileLink(fileId);
                        let buf = Buffer.alloc(0);
                        await ffmpeg(link)
                            .outputOption('-vf', 'scale=320:-1:flags=lanczos,fps=15')
                            .format('gif')
                            .pipe(buf, { end: true })
                            .on('data', function(chunk) {
                                buf = Buffer.concat([buf, chunk]);
                            })
                            .on('end', async () => {
                                const message = `${fullName}\nПрислал гифку`;
                                const attachment = await vk.upload.messageDocument(
                                    {
                                        peer_id: process.env.VK_CHAT_ID, 
                                        source: buf
                                    });
                                vk.api.messages.send(
                                    {
                                        peer_id: process.env.VK_CHAT_ID, 
                                        message: message,
                                        attachment: attachment
                                    }); 
                            });
                    } catch (err) {
                        handleError(context, fullName, err);             
                    }
                    break; 
                }
                default : {
                    console.log(`Необрабатываемый тип ${context.updateSubTypes[0]}`);
                    try {
                        const message = `${fullName}\nПрислал необрабатываемый тип ${context.updateSubTypes[0]}`;
                        vk.api.messages.send(
                            {
                                peer_id: process.env.VK_CHAT_ID, 
                                message: message
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

export {tgActions};