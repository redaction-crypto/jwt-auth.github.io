
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authRequire = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
        if (err) {
            console.log(err.message);
            res.redirect('/login');
        } else {
            console.log(decodedToken);
            next();
        }
        });
    } else {
        res.redirect('/login');
    }
};

// check current user
const checkCurrentUser = (req, res, next) => {
    let user
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                user = await User.findBy("id", decodedToken.id)
                // console.log(user);
                res.locals.user = user
                next()
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};


module.exports = { authRequire, checkCurrentUser };