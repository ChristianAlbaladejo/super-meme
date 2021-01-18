'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_para_mi_api_redsocial';

exports.ensureAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'The request havent got auth head' });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                message: 'The token expired'
            })
        }
    } catch (ex) {
        return res.status(404).send({
            message: 'Invalid token'
        })
    }

    req.user = payload;

    next();
}