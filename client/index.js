var path                = require('path');
var express             = require('express');
var passport            = require('passport');
var morgan              = require('morgan');
var bodyParser          = require('body-parser');
var cookieParser        = require('cookie-parser');
var cookieSession       = require('cookie-session');
var Strategy            = require('./passport-myserver-oauth2').Strategy;
var app                 = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cookieParser('aoghasdgalsadf213'));
app.use(cookieSession({name: 'client-session', keys: ['abc']}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
      done(null, user);
});

passport.deserializeUser(function(user, done) {
      done(null, user);
});

var ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { 
      return next();
  }
  res.redirect('/login');
};

passport.use(
    new Strategy({
        clientID: '123-456-789',
        clientSecret: 'shhh-its-a-secret',
        callbackURL: 'http://localhost:8080/login/oauth/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(arguments);
        done(null, profile);
    })
);

app.get('/', function(req, res) { 
    res.render('index', {
        user: req.session.user
    });
});
app.get('/login', passport.authenticate('myserver'));
app.get('/login/oauth/callback',
    passport.authenticate('myserver', { 
        successRedirect: '/admin',
        failureRedirect: '/'
    })
);

app.get('/admin',
    ensureAuthenticated,
    function(req, res) {
        console.log(req.session);
        res.render('admin', {
            user: req.session.passport.user
        });
    }
);

app.listen(8080);
