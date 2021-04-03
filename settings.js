module.exports = {
  "levels": {
    "name": "Levels",
    "icon": "/trophy.svg",
    "description": "Let your users gain XP and levels by participating in the chat!",
    "custom": true,
    "custom_file": "/home/runner/ThunderBot-Dashboard/www/levels.html"
  },
  "moderation": {
    "name": "Moderation",
    "icon": "/moderation.svg",
    "description": "Sit back and relax while ThunderBot moderates your server for you",
    "custom": true,
    "custom_file": "/home/runner/ThunderBot-Dashboard/www/moderation.html"
  },
  "music": {
    "name": "Music",
    "icon": "/music.svg",
    "description": "Listen to your favorite tunes right within Discord",
    "custom": false,
    "settings": [

    ]
  },
  "economy": {
    "name": "Economy",
    "icon": "/coin.svg",
    "description": "Play ThunderBot currency games",
    "custom": false,
    "settings": [
      {
        "id": "ff",
        "name": "Family Friendly",
        "description": "Keep the ThunderBot economy clean"
      }
    ]
  },
  "trivia": {
    "name": "Trivia",
    "icon": "/trivia.svg",
    "description": "Play multiple-choice trivia",
    "custom": false,
    "settings": [

    ]
  },
  "search": {
    "name": "Search",
    "icon": "/search.svg",
    "description": "Search the internet",
    "custom": false,
    "settings": [
      {
        "id": "urban",
        "name": "Urban Dictionary",
        "description": "Enable searching the Urban Dictionary"
      }
    ]
  },
  "minigames": {
    "name": "Minigames",
    "icon": "/tictactoe.svg",
    "description": "Play minigames such as Tic Tac Toe",
    "custom": false,
    "settings": [

    ]
  },
  "custom-commands": {
    "name": "Custom Commands",
    "icon": "/customcommand.svg",
    "description": "Add awesome custom commands to your server",
    "custom": true,
    "custom_file": "/home/runner/ThunderBot-Dashboard/www/customcommands.html"
  },
  "memes": {
    "name": "Memes",
    "icon": "/meme.svg",
    "description": "Manage memes in your server",
    "custom": false,
    "settings": [
      {
        "id": "memes",
        "name": "Memes",
        "description": "Enable ThunderBot memes"
      },
      {
        "id": "automeme",
        "name": "Auto Memes",
        "description": "Enable automatic ThunderBot memes"
      }
    ]
  }
}