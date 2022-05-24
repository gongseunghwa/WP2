const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');
const sequelize = require("sequelize");
const Op = sequelize.Op;
const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { title: 'Profile - prj-name' });
});

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', { title: 'Join to - prj-name' });
});

router.get('/', async(req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [
                ['createdAt', 'DESC']
            ],
        });
        res.render('main', {
            title: 'prj-name',
            twits: posts,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 홈으로 가기위한 라우터
router.get('/home', async(req, res, next) => {
    res.redirect('/');
});

//해시태그로 검색기능을 하는 라우터
router.get('/hashtag', async(req, res, next) => {
    const query = req.query.hashtag;
    // console.log("=========================");
    // console.log(query);
    // console.log("=========================");
    if (!query) {
        return res.redirect('/');
    }
    try {
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        console.log("=========================");
        console.log(hashtag);
        console.log("=========================");
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }
        console.log("=========================");
        console.log(posts);
        console.log("=========================");

        return res.render('main', {
            title: `${query} | NodeBird`,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

//context내용으로 검색을 하는 라우터
router.get('/search', async(req, res, next) => {
    const query = req.query.search; //내가 입력한 값을 가져온다.
    // console.log("=========================");
    // console.log(query);
    // console.log("=========================");

    // 값이 없으면 /로 redirect
    if (!query) {
        return res.redirect('/');
    }
    try {
        let posts = [];
        posts = await Post.findAll({
            where: {
                content: {
                    [Op.like]: "%" + query + "%"
                }
            },
            include: [{ model: User }]
        });

        return res.render('main', {
            title: `${query} | NodeBird`,
            twits: posts,
        });

    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;