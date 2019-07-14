const vkActions = (vk,tg) => {
	
	vk.updates.hear('/info', async (context) => {
		if(context.peerId.toString() === process.env.VK_CHAT_ID && context.isUser){	
			const inviteLink = await tg.telegram.exportChatInviteLink(process.env.TG_CHAT_ID)
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
								const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\nvk.com/feed?w=${att.toString()}`;
								tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
								break
							}
							case 'photo' : {
								const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\n${att.largePhoto}`;
								tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
								break
							}
							case 'audio' :{
								const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\nприслал трек:${att.artist} - ${att.title}\n(мб потом прикручу прогрузку треков в вк)`;
								tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
								break
							}
							case 'audio_message' : {
								const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\nприслал войс:`;
								tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
								tg.telegram.sendVoice(process.env.TG_CHAT_ID, att.oggUrl);
								break
							}
							case 'doc' : {
								const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\nприслал Док: ${att.title}\nлинк: ${att.url}`;
								tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
								break
							}
							case 'video' : {
								const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\nотправил видео\nhttps://vk.com/im?z=${att.toString()}`;
								tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
								break
							}
							default : {
								console.log(att.type);
								const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\nприслал какую-то хуйню формата: ${att.type}`;
								tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
								break
							}
						}
					});
				default:
					if(context.text !== null){
						const message = `${vkUser[0].first_name} ${vkUser[0].last_name}\n${context.text}`;
						tg.telegram.sendMessage(process.env.TG_CHAT_ID, message);
					}
			  }
        }
        next()
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
}

export {vkActions};