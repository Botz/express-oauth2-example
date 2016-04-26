var exampleUser = {
    email: 'user@example.com',
    password: 'abc',
    firstname: 'Example',
    lastname: 'User',
    password_reset_token: 'abc'
};

var exampleClient = {
    clientId: '123-456-789',
    clientSecret: 'shhh-its-a-secret',
    redirectUri: 'http://localhost:8080/login/oauth/callback',
};

var authCodes = {};
var accessTokens = {};
var refreshTokens = {};

module.exports = {
    exampleUser: exampleUser,
    getClient: function(clientId, err, cb) {
        console.log('getClient', { cid: clientId });
        cb(null, exampleClient.clientId == clientId ? exampleClient : null);
    },
    getUser: function(email, password, cb) {
        console.log('getUser', { e: email, p: password });
        return cb(null, exampleUser.password == password ? exampleUser : null);
    },
    authenticate: function(email, password, cb) {
        console.log('authenticate', { e: email, p: password });
        return cb(null, exampleUser.password == password ? exampleUser : null);
    },
    saveAuthCode: function(authCode, clientId, expires, userId, cb) {
        authCodes[authCode] = {
            clientId: clientId,
            expires: expires,
            userId: userId
        };
        console.log('saveAuthCode', arguments);
        cb(null);
    },
    getAuthCode: function(authCode, cb) {
        cb(null,authCodes[authCode]);
    },
    saveAccessToken: function(token, clientId, expires, userId, cb) {
        accessTokens[token] = {
            clientId: clientId,
            expires: expires,
            userId: userId
        };
        console.log('saveAccessToken', arguments);
        cb(null);
    },
    getAccessToken: function(token, cb) {
        cb(null, accessTokens[token]);
    },
    grantTypeAllowed: function(clientId, grantType, cb) {
        if (grantType === 'password' || grantType === 'authorization_code') {
            return cb(false, exampleClient.clientId == clientId);
        }
        cb(false,true);
    },
    saveRefreshToken: function(token, clientId, expires, userId, cb) {
        refreshTokens[token] = {
            clientId: clientId,
            expires: expires,
            userId: userId,
            user: userId
        };
        console.log('saveRefreshToken', arguments);
        cb(null);
    },
    getRefreshToken: function(token, cb) {
        cb(null, refreshTokens[token]);
    },
};
