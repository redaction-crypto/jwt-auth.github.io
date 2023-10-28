const User = require('../models/User')
const jwt = require('jsonwebtoken')
require('dotenv').config();

const handleErrors = (err) => {
    let errors = { email: '', password: '', AllOfThem: ''}
    // log in errors
    if(err === 'ErrorCode10001' || err === 'ErrorCode10002') {
        errors.AllOfThem = "Incorrect Email Or Password"
    }
    // sign up errors
    if(err.code === 'ER_DUP_ENTRY') {
        errors.email = "That email is already registrated"
    }
    if (Array.isArray(err) && err[0].code === 'user validator failed') {
        err.forEach(error => {
            if (error.path === 'email') {
                errors.email = error.message;
            }
            if (error.path === 'password') {
                errors.password = error.message;
            }
        });
    }
    return errors;
}

const maxAge = 2 * 60 // 2MIN en second
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body
    try {
        const newuser = await User.create(email, password)
        const token = await createToken(newuser.id)
        console.log(token.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ newuser })
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body
    try {
        const authentificated = await User.login(email, password)
        const token = await createToken(authentificated)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ authentificated })
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/')
}
