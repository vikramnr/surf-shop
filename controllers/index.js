const User = require('../models/user');
const Post = require('../models/post');
const passport = require('passport');
const mapboxToken = process.env.MAPBOX_TOKEN;
const util = require('util');
const {
    cloudinary
} = require('../cloudinary/index');

const {
    deleteProfileImage
} = require('../middleware/index');

module.exports = {
    async landingPage(req, res, next) {
        const posts = await Post.find({})
        res.render('index', {
            posts,
            mapboxToken
        })
    },
    getRegister(req, res, next) {
        res.render('register', {
            title: 'Register',
            username: '',
            email: ''
        });
    },
    getLogin(req, res, next) {
        if (req.isAuthenticated()) return res.redirect('/');
        console.log(req.headers);
        if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
        res.render('login', {
            title: 'Login'
        })
    },
    async postRegister(req, res, next) {
        try {
            if (req.file) {
                const {
                    secure_url,
                    public_id
                } = req.file;
                req.body.image = {
                    secure_url,
                    public_id
                };
            }
            const user = await User.register(new User(req.body), req.body.password);
            console.log('user')
            req.login(user, function (err) {
                if (err) return next(err);
                req.session.success = `Welcome to Surf Shop, ${user.username}!`;
                res.redirect('/');
            });
        } catch (err) {
            deleteProfileImage(req);
            const {
                username,
                email
            } = req.body;
            let error = err.message;
            if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
                error = 'A user with the given email is already registered';
            }
            res.render('register', {
                title: 'Register',
                username,
                email,
                error
            })
        }
    },
    async postLogin(req, res, next) {
        const {
            username,
            password
        } = req.body;
        const {
            user,
            error
        } = await User.authenticate()(username, password);
        if (!user && error) {
            return next(error);
        }
        req.login(user, function (err) {
            if (err) return next(err);
            req.session.success = `Welcome back, ${username}!`;
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        });
    },
    getLogout(req, res, next) {
        req.logout();
        res.redirect('/');
    },
    async getProfile(req, res, next) {

        const posts = await Post.find().where('author').equals(req.user._id).limit(10).exec();
        res.render('profile', {
            posts
        });
    },
    async updateProfile(req, res, next) {
        const {
            username,
            email
        } = req.body;
        const {
            authuser
        } = res.locals;
        if (req.file) {
            if (authuser.image.public_id) await cloudinary.v2.uploader.destroy(authuser.image.public_id);
            const {
                secure_url,
                public_id
            } = req.file;
            authuser.image = {
                secure_url,
                public_id
            };
        }
        if (username) authuser.username = username;
        if (email) authuser.email = email;
        await authuser.save();
        const login = util.promisify(req.login.bind(req));
        await login(authuser);
        req.session.success = 'Profile updated'
        res.redirect('/');
    }
};