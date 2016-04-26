var path                = require('path');
var express             = require('express');
var passport            = require('passport');
var morgan              = require('morgan');
var bodyParser          = require('body-parser');
var cookieParser        = require('cookie-parser');
var cookieSession       = require('cookie-session');
var OAuth2Strategy      = require('passport-oauth').OAuth2Strategy;
var app                 = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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


// this should go into an own provider strategy like passport-jep-oauth2
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
    this._oauth2.get('http://localhost:3000/account.json', accessToken, function (err, body, res) {
        if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
        try {
            var json = JSON.parse(body);
            var profile = json;
            done(null, profile);
        } catch(e) {
            done(e);
        };
    });

};

passport.use(
    'provider', 
    new OAuth2Strategy({
        authorizationURL: 'http://localhost:3000/oauth/authorise',
        tokenURL: 'http://localhost:3000/oauth/token',
        clientID: '123-456-789',
        clientSecret: 'shhh-its-a-secret',
        callbackURL: 'http://localhost:8080/login/oauth/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(arguments);
        // populate to own db?
        done(null, profile);
    })
);

app.get('/', function(req, res) { 
    res.render('index', {
        user: req.session.user
    });
});
app.get('/login', passport.authenticate('provider'));
app.get('/login/oauth/callback',
    passport.authenticate('provider', { 
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
