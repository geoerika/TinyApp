'use strict';

var express = require('express');
var cookieSession = require('cookie-session'); //to store cookies on the client
var bcrypt = require('bcryptjs'); //to hash passwords
const bodyParser = require('body-parser');

var app = express();
var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['hsdklhfd'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//global variables

const urlDatabase = {  //database for short urls with their coresponding long urls and user creators
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
  }
};

const users = {   //database for users
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

//Functions

const generateRandomString = () => {  //generates a random user.id and a short url

  let charString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    randomString += charString[Math.floor(Math.random() * charString.length)];
  }
  return randomString;
};


const findMatch = (match, userObj)=> {  //checks if a registering email or password exists in the database

  const usersArray = Object.values(users);
  let foundMatch = false;

  for (let user in usersArray) {
    if (user.email === match || user.password === match) {
      foundMatch = true;
    }
  }
  return foundMatch;
};


const matchEmailPass = (email, password) => {   //function to check if an email and password match for one user

  const usersArray = Object.values(users); //creates a list of users
  let foundMatch = false;

  for (let user of usersArray) {
    if ((user.email === email) && (user.password === password)) {
      foundMatch = true;
    }
  }
  return foundMatch;
};


const userIdbyEmail = (email) => {  //get the user.id if email known

  const usersArray = Object.values(users); //creates a list of users
  let userId = 0;

;  for (let user of usersArray) {
    if (user.email === email) {
      userId = user.id;
    }
  }
  return userId;
 }


 const userPassbyEmail = (email) => {  //get user.password if email known

  const usersArray = Object.values(users); //creates a list of users
  let userPass = 0;

  for (let user of usersArray) {
    if (user.email === email) {
      userPass = user.password;
    }
  }
  return userPass;
 };


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

//ROUTES

app.get('/', (req, res) => {    //redirects to /urls or /login, depending if there is a user logged in or registered

  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.get('/urls', (req, res) => {    //opens a page with a list of short urls and their corresponding long urls that belong to a logged in user

  if(req.session.user_id) {
    let userId = req.session.user_id;
    let userUrlsArray= urlsForUser(userId, urlDatabase);
    let templateVars = {
      email: users[userId].email,
      urls: userUrlsArray
    };
    res.render('urls_index', templateVars);
  } else {
    res.status(403).send('No Permission to Access');
  }
});


app.get('/hello', (req, res) => {   //not sure we still need this, maybe in the future

  let userId = req.session.user_id;
  let templateVars = {
    email: users[userId].email,
    greeting: 'Hello World!'
  };
  res.render('hello_world', templateVars);
});


app.get('/urls/new', (req, res) => {    //opens a page for generating a short url for a given long url

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


app.get('/urls/:id', (req, res) => {   //opens a page to update a certain long url

  if (req.session.user_id) {
    let userId = req.session.user_id;
    let templateVars = {
      user: users[userId],
      email: users[userId].email,
      shortURL: req.params.id,
      fullURL: urlDatabase[req.params.id].longURL
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(403).send('No Permission to Access');
  }
});


app.post('/urls', (req, res) => {  //records a new short url in the database

  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;

  res.redirect(`/urls/${shortURL}`);
});


app.get('/urls/:shortURL', (req, res, next) => {            //checks if there is a long URl in the database
                                                            //corresponding to the short url trying to access
  let longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL) {
    res.redirect('/urls');
  } else {
    res.send('No such shortURL!!\n');
  }
});


app.get("/u/:shortURL", (req, res, next) => {  //uses a short url to navigate to the corresponding website

  let longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send('No such shortURL!!\n');
  }
});


app.post('/urls/:id/delete', (req, res) => {    //deletes a short url object from the database when delete is clicked

  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(403).send('No Permission to Access');
  }
});


app.post('/urls/:id/update', (req, res) => {  //records an updated long url in the database

  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.fullURL;
    res.redirect('/urls');
  } else {
    res.status(403).send('No Permission to Access');
  }
});


app.get('/login', (req, res) => {   //sends the user to a login page

  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});


app.post('/login', (req, res) => {  //manages login and sets session cookies

  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userPassinDatabase = userPassbyEmail(userEmail);

  if (!findMatch(userEmail, users)) {
    res.status(403).send('No Permission to Access');
  } else {
    if (!bcrypt.compareSync(userPassword, userPassinDatabase)) {  //checks provided password against hashed user password in user database
    res.status(403).send('No Permission to Access');
    } else {
      let userId = userIdbyEmail(userEmail);
      req.session.user_id = userId;   //sets the session cookie
      res.redirect('/');
    }
  }
});


app.post('/logout', (req, res) => {   //logs out a user and clears session cookies

  req.session = null;
  res.redirect('/login');
});


app.get('/register', (req, res) => {  //renders a registration page

  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('register');
  }
});


app.post('/register', (req, res) => {   //manages registration process

  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10); //password hashing using bcryptjs

  if (!userEmail || !userPassword) {    //checking if the new user provided both email and password
    res.status(400).send('Bad Request');
  } else if (findMatch(userEmail, users)) {   //checking if user email alreday exists in the database
    res.status(400).send('Bad Request');
  } else {
    let userId = generateRandomString();
    users[userId] = {};
    users[userId].id = userId;        //records a user id, email, and hashed password in the user database
    users[userId].email = userEmail;
    users[userId].password = hashedPassword;
    req.session.user_id = userId;   //sets the session cookie

    res.redirect('/urls');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
