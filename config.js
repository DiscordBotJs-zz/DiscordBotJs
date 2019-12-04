module.exports = {
	prefix: "+", // Le prefix du bot
	prefixMusic: "music-", // C'est le prefix pour la musique
	ownerID: process.env.OWNERID, // Votre identifiant Discord faire (le prefix définie)user-info pour voir votre ID ou activer le mode développer et copier votre identifiant
	botToken: process.env.TOKEN, // Token du bot ou "process.env.TOKEN" pour Heroku
	youtubeapikey: process.env.YOUTUBEAPIKEY, // Youtube Api Key
	logs: "", // Logs Channel ID
	discordinvite: "discord.gg/invite/UqUsr5x", // Invitation du serveur
	colorembed: "#7289D9", // Couleur du l'embed
	picturewelcomeleave: "https://i.imgur.com/2rNY0D1.png", // Image des messages Welcome et Leave
	disboardmessageeveryhours: "0",
	// Reaction Role
	deleteSetupCMD: false, // Si cela est activé la commande sera supprimé après utilisation ** fortement déconseillé **
	initialMessage: `**Réagissez aux messages ci-dessous pour recevoir le rôle associé. Si vous souhaitez supprimer le rôle, supprimez simplement votre réaction !**`, // Message par défaut de l'embed
	embedMessage: `
	Réagissez aux émoticônes correspondant au rôle que vous souhaitez recevoir.
	Si vous souhaitez supprimer le rôle, supprimez simplement votre réaction !
	`, // Message de l'embed
	embedFooter: "Réactions Rôle",
	roles: ["Notif"], // Le nom des roles que vous voulez (Faites à attention au maj etc)
	reactions: ["🔔"], // Emoji Reactions (Emoji normal: :bell:) - (Emoji custom: le nom de l'emoji custom)
	embed: true, // L'embed
	embedColor: "#7289D9", // Couleur du l'embed
	embedThumbnail: false, // Le Thumbnail
	embedThumbnailLink: "" // Si Thumbnail activé le lien du l'image ** je déconseille de l'activé perso **
	// Reaction Role
};
