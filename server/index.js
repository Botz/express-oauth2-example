var path          = require('path');
var express       = require('express');
var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');
var cookieSession = require('cookie-session');
var morgan        = require('morgan');
var oauthserver   = require('oauth2-server');
var model         = require('./model'); 
var app           = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cookieParser('ncie0fnft6wjfmgtjz8i'));
app.use(cookieSession({name: 'session', keys: ['abc']}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

app.oauth = oauthserver({
  model: model, 
  grants: ['password', 'authorization_code', 'refresh_token'],
  debug: true
});

var ensureAuthenticated = function(req, res, next) {
    if (req.session.user) {
        next(); 
    }
    res.redirect('/login');
};
 
app.all('/oauth/token', app.oauth.grant());
app.get('/oauth/authorise', function(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?redirect=' + encodeURIComponent(req.path + '?client_id=' + req.query.client_id + '&redirect_uri=' + req.query.redirect_uri));
    }
    res.render('authorise', {
        client_id: req.query.client_id,
        redirect_uri: req.query.redirect_uri
    });
});

// Handle authorise
app.post('/oauth/authorise',
    function(req, res, next) {
        console.log('authorize', req.session);
        if (!req.session.user) {
            return res.redirect('/login?redirect=' + encodeURIComponent(req.path + '?client_id=' + req.query.client_id +'&redirect_uri=' + req.query.redirect_uri));
        }
        console.log("next");
        next();
    },
    app.oauth.authCodeGrant(function(req, next) {
        // The first param should to indicate an error
        // The second param should a bool to indicate if the user did authorise the app
        // The third param should for the user/uid (only used for passing to saveAuthCode)
        console.log('authCodeGrant');
        next(null, req.body.allow === 'yes', req.session.userId, null);
    })
);


app.get('/', function (req, res) {
    console.log('/', req.session);
    res.render('index');
});

app.get('/login', function(req,res) {
    res.render('login', {
        redirect: req.query.redirect
    });
});
app.post('/login', function(req,res) {
    console.log('post login', req.body, req.session); 
    model.authenticate(req.body.email, req.body.password, function(err, user) {
        if (user) {
            req.session.user   = user;
            req.session.userId = user;
            var redirect = (req.query.redirect != null ? req.query.redirect : '/');
            res.redirect(redirect); 
        }
        else {
            res.status(401).render('login');
        }
    });    
});

app.get('/account',
    ensureAuthenticated,
    function(req,res) {
        res.render('account', {
            user: req.session.user
        }); 
    }
);
app.get('/account.json', 
    function(req,res) {
        if (req.query.access_token) {
            model.getAccessToken(req.query.access_token, function(err, result) {
               // get userByUserId result.userId
                res.json(model.exampleUser); 
            });
        }
        else {
            res.status(400).send("error");
        }
    }
);
 
app.use(app.oauth.errorHandler());
 
app.listen(3000);
