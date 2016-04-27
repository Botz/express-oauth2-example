var util           = require('util');
var OAuth2Strategy = require('passport-oauth2');
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;

function Strategy (options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'http://localhost:3000/o/oauth2/auth';
    options.tokenURL = options.tokenURL || 'http://localhost:3000/o/oauth2/token';
    OAuth2Strategy.call(this, options, verify);
    this.name = 'myserver';
}

util.inherits(Strategy, OAuth2Strategy);

// this should go into an own provider strategy like passport-jep-oauth2
Strategy.prototype.userProfile = function(accessToken, done) {
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

exports = module.exports = Strategy;
exports.Strategy = Strategy;
