var express = require('express');
var cookieSession = require('cookie-session');
var bcrypt = require('bcryptjs');


var app = express();

var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['hsdklhfd'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  'b2xVn2': {
    longURL:'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },

  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user2RandomID'
  },

  'b4xVn6': {
    longURL:'http://www.amazon.ca',
    userID: 'user2RandomID'
  },
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

function matchEmailPass (email, password) {
  const usersArray = Object.values(users); //creates a list of users
  let foundMatch = false;
  for (let user of usersArray) {
    if ((user.email === email) && (user.password === password)) {
      foundMatch = true;
    }
  };
  return foundMatch;
}

function userIdbyEmail (email) { //gets the user.id if email known
  const usersArray = Object.values(users); //creates a list of users
  let userId = 0;
  for (let user of usersArray) {
    if (user.email === email) {
      userId = user.id;
    }
  }
  return userId;
 }

 function userPassbyEmail (email) {  //gets user.password if email known
  const usersArray = Object.values(users); //creates a list of users
  let userPass = 0;
  for (let user of usersArray) {
    if (user.email === email) {
      userPass = user.password;
      console.log("userPassword: ", userPass);
    }
  }
  return userPass;
 }

const urlsForUser = (userId) => { //returns a list of objects with shortURL and longURL as keys

  let retUrlArr = [];
  Object.keys(urlDatabase).forEach((url) => {
    if (urlDatabase[url].userID === userId) {
      let retUrlObj = {};
      retUrlObj.longURL ='';
      retUrlObj.shortURL = url;
      retUrlObj.longURL = urlDatabase[url].longURL;
      retUrlArr.push(retUrlObj);
    }
  });
  return retUrlArr;
};

app.get('/', (req, res) => {

  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    let userId = req.session.user_id;
    let userUrlsArray= urlsForUser(userId, urlDatabase);
    console.log("urlDatabase:", urlDatabase);
    let templateVars = {
      email: users[userId].email,
      urls: userUrlsArray
    };
    res.render('urls_index', templateVars);
  } else {

  }
});

app.get('/hello', (req, res) => {
  let userId = req.session.user_id;
  let templateVars = {
    user: users[userId],
    greeting: 'Hello World!'
  };
  res.render('hello_world', templateVars);
});

app.get('/urls/new', (req, res) => {

  if(req.session.user_id) {
    let userId = req.session.user_id;
    let templateVars = {
      user: users[userId],
      email: users[userId].email
    }
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  let userId = req.session.user_id;
  let templateVars = {
    user: users[userId],
    email: users[userId].email,
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id].longURL
  };
  res.render('urls_show', templateVars);
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;    // Respond with 'Ok'
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res, next) => {

  let longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL) {
    res.redirect('/urls');
  } else {
    res.send('No such shortURL!!\n');
  }
});

app.get("/u/:shortURL", (req, res, next) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log("longUrl:", longURL);
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send('No such shortURL!!\n');
  }
});

app.post('/urls/:id/delete', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(403).send('No Permission to Access');
  }
});

app.post('/urls/:id/update', (req, res) => {
  console.log("req.session.user_id", req.session.user_id);
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.fullURL;
    console.log("urlDatabase[req.params.id].longURL:", urlDatabase[req.params.id].longURL);
    res.redirect('/urls');
  } else {
    res.status(403).send('No Permission to Access');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', (req, res) => {

  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userPassinDatabase = userPassbyEmail(userEmail);

  if (!findMatch(userEmail, users)) {
    res.status(403).send('No Permission to Access');
  } else {
    if (!bcrypt.compareSync(userPassword, userPassinDatabase)) {
    res.status(403).send('No Permission to Access');
    } else {
      let userId = userIdbyEmail(userEmail);
      req.session.user_id = userId;
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
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  if (!userEmail || !userPassword) {
    res.status(400).send('Bad Request');
  } else if (findMatch(userEmail, users)) {
    res.status(400).send('Bad Request');
  } else {
    let userId = generateRandomString();
    users[userId] = {};
    users[userId].id = userId;
    users[userId].email = userEmail;
    users[userId].password = hashedPassword;
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
