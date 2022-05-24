const express = require('express')

const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, async(req, res, next) => {
    res.redirect('/');
});