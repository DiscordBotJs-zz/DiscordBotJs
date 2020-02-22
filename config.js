module.exports = {
	prefix: "+", // Le prefix du bot
	prefixMusic: "music-", // C'est le prefix pour la musique
	ownerID: "609174280734900226", // Votre identifiant Discord faire (le prefix définie)user-info pour voir votre ID ou activer le mode développer et copier votre identifiant
	botToken: "NjEyNjE0NDE2Nzc2NTYwNjcx.XlEQGQ.aubKkPoe6V21HO0FYC2JYyOssJE", // Token du bot ou "process.env.TOKEN" pour Heroku
	youtubeapikey: process.env.YOUTUBEAPIKEY, // Youtube Api Key
	logs: "", // Logs Channel ID
	colorembed: "#F7DF1E", // Couleur du l'embed
	picturewelcome: "https://i.imgur.com/kL9RmmX.jpg", // Image du message Welcome
	pictureleave: "https://i.imgur.com/gZDozPk.jpg", // Image du message Leave
	creator: "Alex Animate Mp4#2361", // Créateur du bot
	version: "1.6.0", // Version du bot
	invitesupport: "https://disboard.org/fr/server/629960788840546304", // Invitation Discord pour le support server
	videopresentation: "https://youtu.be/cIFhTOgT4Oc", // Vidéo présentation (peut être mise à jour !)
	langue: "french", // La langue du bot
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
	embedColor: "#F7DF1E", // Couleur du l'embed
	embedThumbnail: false, // Le Thumbnail
	embedThumbnailLink: "" // Si Thumbnail activé le lien du l'image ** je déconseille de l'activé perso **
	// Reaction Role
};
