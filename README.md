# Music Quiz Bot

Discord Bot to play music quiz but actually good fr

Plays songs and guess the song title or artist!

# How to play

To start a quiz, put the following command in Discord:
```
/start-quiz playlist: YOUTUBE_PLAYLIST_ID
```

Optionally, you can set the length of songs played:
```
/start-quiz playlist: YOUTUBE_PLAYLIST_ID length: 5
```

Earn points by sending a message with the song title or artist name:
(include image example)


To end the quiz:
```
/end-quiz
```

# How to use

Create a Discord application in Discord Developer Portal

Make sure to enable **Message Content Intent** in Bot > Privileged Gateway Intents

Copy the files and make sure to have `npm`

Edit `config.json` with the following (replace `CLIENT_ID` and `DISCORD_TOKEN` with your bots):
```
{
    "clientId": "CLIENT_ID",
    "token": "DISCORD_TOKEN"
}
```

Invite your bot to your server:
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Bare minimum permissions: `1126451813370944`

Run the bot with:
```
npm start
```

and start playing!
