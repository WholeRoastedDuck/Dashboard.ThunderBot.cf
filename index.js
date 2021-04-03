const express = require('express');
const fetch = require('node-fetch');
const Frontly = require('frontly');
const settings = require('./settings.js');
const db = require('ognom.db');
const bodyParser = require('body-parser');
const app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());

function guildIconPng(id, avatar, size) {
  if (avatar == null) {
    return `https://dashboard.thunderbot.cf/discord.png`;
  } else {
    return `https://cdn.discordapp.com/icons/${id}/${avatar}.png?size=${size || 512}`;
  }
}
function randomize(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
function oauth(state) {
  if (state) {
    return `https://discord.com/api/oauth2/authorize?client_id=783743297453686795&redirect_uri=https%3A%2F%2Fdashboard.thunderbot.cf%2Fauthorized&response_type=code&scope=email%20identify%20guilds&state=${state}`;
  } else {
    return `https://discord.com/api/oauth2/authorize?client_id=783743297453686795&redirect_uri=https%3A%2F%2Fdashboard.thunderbot.cf%2Fauthorized&response_type=code&scope=email%20identify%20guilds`;
  }
}
function serverInfo(id) {
  return new Promise((resolve, reject) => {
      fetch('https://thundebot.yodacode.repl.co/api/serverinfo', {
        headers: {
          'content-type': "application/json"
        },
        method: "POST",
        body: JSON.stringify({guild:id})
      }).then(a => a.json()).then(guild => {
          resolve(guild);
        });
  });
}
function checkAuth(req) {
  return new Promise((resolve, reject) => {
    if (!req.session.get('discord_auth')) return resolve(false);
    var userFetch = fetch('https://discord.com/api/users/@me', {
      headers: {
        authorization: req.session.get('discord_auth'),
      },
    }).then(a => a.json()).then(response => {
      if (response.message) return resolve(false);
      resolve(true);
    });
  });
}
var sessions = {
  states: []
};
var sessionStorage = {};
app.use((req, res, next) => {
  if (!req.cookies.session) res.cookie('tb-session', randomize(30), {expire: 360000 + Date.now()});
  req.sessionID = req.cookies.session;
  req.session = {};
  req.session.get = (key) => {
    if (sessionStorage[req.sessionID] == undefined || sessionStorage[req.sessionID] == null) sessionStorage[req.sessionID] = {};
    return sessionStorage[req.sessionID][key];
  }
  req.session.getAll = () => {
    if (sessionStorage[req.sessionID] == undefined || sessionStorage[req.sessionID] == null) sessionStorage[req.sessionID] = {};
    return sessionStorage[req.sessionID];
  }
  req.session.set = (key, value) => {
    if (sessionStorage[req.sessionID] == undefined || sessionStorage[req.sessionID] == null) sessionStorage[req.sessionID] = {};
    return sessionStorage[req.sessionID][key] = value;
  }
  res.logout = () => {
    sessionStorage.delete(req.sessionID);
    req.sessionID = null;
    res.clearCookie('tb-session');
  }
  next();
});
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(Frontly.middleware);
(async () => {
  var data = await db.get('*');
  if (!data.responses) {
    await db.set('responses', []);
  }
})(); 

app.use(express.static(__dirname + '/www'));
app.get('/', (req, res) => {
  res.sendFileFrontly(__dirname + '/www/home.html', {
    params: {
      'Add': '<!-- Comment -->'
    }
  });
});

app.get('/servers', async (req, res) => {
  if (req.session.get('discord_auth')) {
    var guildFetch = fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        authorization: req.session.get('discord_auth'),
      },
    });
    guildFetch.then(a => a.json()).then(guilds => {
      var guildArray = [];
      for (var i = 0; i < guilds.length; i++) {
        guildArray.push(guilds[i].id);
      }
      for (var i = 0; i < guilds.length; i++) {
        guilds[i].iconURL = guildIconPng(guilds[i].id, guilds[i].icon);
      }
      fetch('https://thundebot.yodacode.repl.co/api/manage', {
        headers: {
          'content-type': "application/json"
        },
        method: "POST",
        body: JSON.stringify({guilds:guildArray,id:req.session.get('user_id')})
      }).then(a => a.json()).then(mutualGuilds => {
          req.session.set('mutual_guilds', mutualGuilds);
          var newGuilds = [];
          for (var i = 0; i < guilds.length; i++) {
            if (mutualGuilds.includes(guilds[i].id)) newGuilds.push(guilds[i]);
          }
          res.sendFileFrontly(__dirname + '/www/servers.html', {
            params: {
              'Guilds': JSON.stringify(newGuilds)
            }
          });
        });
      });
  } else {
    res.redirect('/authorize');
  }
});

app.get('/servers/:id', (req, res) => {
  res.redirect(`/servers/${req.params.id}/plugins`);
});

app.get('/servers/:id/plugins', async (req, res) => {
  var server = await serverInfo(req.params.id);
  if (req.session.get('discord_auth')) {
    res.sendFileFrontly(__dirname + '/www/plugins.html', {
      params: {
        'Server': req.params.id,
        'Icon': server.iconURL,
        'Name': server.name
      }
    });
  } else {
    res.redirect('/authorize');
  }
});

app.get('/authorized', (req, res) => {
  if (req.query.state == req.session.get('state')) {
		const data = {
    	client_id: '783743297453686795',
    	client_secret: 'G3eTz_qfuW7fvicuBPnON7kRbJCekGn1',
    	grant_type: 'authorization_code',
    	redirect_uri: 'https://dashboard.thunderbot.cf/authorized',
    	code: req.query.code,
    	scope: 'identify guilds email',
		};
    fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams(data),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
		.then(a => a.json())
		.then((info) => {
      console.log(info);
      req.session.set('discord_auth', `${info.token_type} ${info.access_token}`);
      var userFetch = fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: req.session.get('discord_auth'),
        },
      });
      /*
      var guildFetch = fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          authorization: `${info.token_type} ${info.access_token}`,
        },
      });
      */
      userFetch
      .then(a => a.json())
      .then(userInfo => {
        req.session.set('user_id', userInfo.id);
        req.session.set('username', userInfo.username);
        req.session.set('discrim', userInfo.discriminator);
        req.session.set('avatar', userInfo.avatar);
        res.redirect('/servers');
      }).catch((error) => {
        console.error(error);
        res.send('Our servers died. :b');
      });
    });
  } else {
    res.redirect('/authorize');
  }
});

app.get('/authorize', (req, res) => {
  var state = randomize(16);
  req.session.set('state', state);
  res.redirect(oauth(state));
});

app.get('/servers/:id/plugins/:plugin', async (req, res) => {
  var server = await serverInfo(req.params.id);
  if (req.session.get('discord_auth')) {
    if (Object.keys(settings).includes(req.params.plugin)) {
      if (settings[req.params.plugin].custom == false) {
        res.sendFileFrontly(__dirname + '/www/plugin.html', {
          params: {
            'PluginName': settings[req.params.plugin].name,
            'PluginIcon': settings[req.params.plugin].icon,
            'PluginDesc': settings[req.params.plugin].description,
            'Server': req.params.id,
        'Icon': server.iconURL,
        'Name': server.name
          }
        });
      } else {
        res.sendFileFrontly(__dirname + '/www/plugin.html', {
          params: {
            'PluginName': settings[req.params.plugin].name,
            'PluginIcon': settings[req.params.plugin].icon,
            'PluginDesc': settings[req.params.plugin].description,
            'Server': req.params.id,
        'Icon': server.iconURL,
        'Name': server.name
          }
        });
      }
    } else {
      res.send("Unknown plugin");
    }
  } else {
    res.redirect('/authorize');
  }
});

app.get('/servers/:id/settings', async (req, res) => {
  var server = await serverInfo(req.params.id);
  if (req.session.get('discord_auth')) {
    res.sendFileFrontly(__dirname + '/www/serversettings.html', {
      params: {
        'Server': req.params.id,
        'Icon': server.iconURL,
        'Name': server.name
      }
    });
  } else {
    res.redirect('/authorize');
  }
});

app.get('/settings', (req, res) => {
  if (req.session.get('discord_auth')) {
    res.sendFileFrontly(__dirname + '/www/settings.html', {
      params: {
      }
    });
  } else {
    res.redirect('/authorize');
  }
});

app.get('/servers/:id/leaderboard', async (req, res) => {
  var server = await serverInfo(req.params.id);
  if (req.session.get('discord_auth')) {
    res.sendFileFrontly(__dirname + '/www/serverleaderboard.html', {
      params: {
        'Server': req.params.id,
        'Icon': server.iconURL,
        'Name': server.name
      }
    });
  } else {
    res.redirect('/authorize');
  }
});

app.get('/leaderboard/:id', (req, res) => {
  //
});

app.get('/api/*', (req, res) => {
  fetch('https://thundebot.yodacode.repl.co/api/'+req.path.substring(5), {
    method: "GET",
    headers: req.headers
  }).then(a => {
    a.text().then(b => {
      try {
        res.set(Object.fromEntries(a.headers.entries()));
      } catch (err) {
      }
      res.status(a.status).send(b);
    })
  });
});

app.post('/api/*', (req, res) => {
  fetch('https://thundebot.yodacode.repl.co/api/'+req.path.substring(5), {
    method: "POST",
    headers: {
      'content-type': req.headers["content-type"]
    }
  }).then(a => {
    a.text().then(b => {
      try {
        res.set(Object.fromEntries(a.headers.entries()));
      } catch (err) {
      }
      res.status(a.status).send(b);
    })
  });
});

app.delete('/api/*', (req, res) => {
  fetch('https://thundebot.yodacode.repl.co/api/'+req.path.substring(5), {
    method: "DELETE"
  }).then(a => {
    a.text().then(b => {
      try {
        res.set(Object.fromEntries(a.headers.entries()));
      } catch (err) {
      }
      res.status(a.status).send(b);
    })
  });
});

app.listen(8080, () => {
  console.log('Listening on *:8080');
});