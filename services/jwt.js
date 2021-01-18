'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_para_mi_api_redsocial'

exports.createToken = function (user) {
    var payload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    };

    return jwt.encode(payload, secret);
}