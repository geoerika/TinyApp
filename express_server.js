var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();

var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(cookieParser());

var urlDatabase = {
  'b2xVn2': {
    longURL:'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },

  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user4RandomID'
  }
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'hoo'
  },
  'user3RandomID': {
    id: 'user3RandomID',
    email: 'user3@example.com',
    password: 'travel-fun'
  },
  'user4RandomID': {
    id: 'user4RandomID',
    email: 'user4@example.com',
    password: 'sleep-deprived'
  }
};

app.get('/', (req, res) => {

  if (req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  if(req.cookies.user_id) {
    let userId = req.cookies.user_id;
    let templateVars = {
      user: users[userId],
      urls: urlDatabase
    };
  } else {
    res.render('urls_index', templateVars);
  }
});

app.get('/hello', (req, res) => {
  let userId = req.cookies.user_id;
  let templateVars = {
    user: users[userId],
    greeting: 'Hello World!'
  };
  res.render('hello_world', templateVars);
});

app.get('/urls/new', (req, res) => {

  if(req.cookies.user_id) {
    let userId = req.cookies.user_id;
    let templateVars = {
      user: users[userId]
    }
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  let userId = req.cookies.user_id;
  let templateVars = {
    user: users[userId],
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id].longURL
  };
  res.render('urls_show', templateVars);
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL].longURL = req.body.longURL;    // Respond with 'Ok'
  res.redirect(`/urls/${shortURL}`);
});

app.get('/u/:shortURL', (req, res, next) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send('No such shortURL!!\n');
  }
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.fullURL;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', (req, res) => {

  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (!findMatch(userEmail, users)) {
    res.status(403).send('No Permission to Access');
  } else {
    if (!findMatch(userPassword, users)) {
    res.status(403).send('No Permission to Access');
    } else {
      let userId = generateRandomString();
      users[userId] = {};
      users[userId].id = userId;
      users[userId].email = userEmail;
      users[userId].password = userPassword;
      res.cookie('user_id', userId);
      res.redirect('/');
    }
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie.user_id;
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {

  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    res.status(400).send('Bad Request');
  } else if (findMatch(userEmail, users)) {
    res.status(400).send('Bad Request');
  } else {
    let userId = generateRandomString();
    users[userId] = {};
    users[userId].id = userId;
    users[userId].email = userEmail;
    users[userId].password = userPassword;
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
});

function generateRandomString() {
  let charString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += charString[Math.floor(Math.random()*charString.length)]
  }
  return randomString;
}

function findMatch (match, userObj) {
  const usersArray = Object.values(users);
  let foundMatch = false;
  for (user of usersArray) {
    if (user.email === match || user.password === match) {
      foundMatch = true;
    }
  }
  return foundMatch;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);

});
