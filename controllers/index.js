const User = require('../models/user');
const Post = require('../models/post');
const {
    cloudinary
} = require('../cloudinary/index');

const {
    deleteProfileImage
} = require('../middleware/index');

const util = require('util');
const crypto = require('crypto');
const passport = require('passport');
const sgMail = require('@sendgrid/mail');

const mapboxToken = process.env.MAPBOX_TOKEN;
sgMail.setApiKey(process.env.SEND_GRID);

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
    },
    getForgotPw(req, res, next) {
        res.render('users/forgot');
    },
    async putForgotPw(req, res, next) {
        const token = await crypto.randomBytes(20).toString('hex');
        const user = await User.findOne({
            email: req.body.email
        })
        if (!user) {
            req.session.error = 'No account with that email address exists.';
            return res.redirect('/forgot-password');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        const msg = {
            to: user.email,
            from: 'Surf Shop Admin <doyouthinkyouknowha@email.com>',
            subject: 'Surf Shop - Forgot Password',
            text: `Requeste of the reset of the password for your account.
                Please click on the following link, or copy and paste it into your browser to complete the process:
                http://${req.headers.host}/reset/${token}
                If you did not request this, please ignore this email and your password will remain unchanged. 
                Thanks Surf Team`.replace(/                /g, ''),
        };

        await sgMail.send(msg);

        req.session.success = `An e-mail has been sent to ${user.email} with further instructions.`;
        res.redirect('/forgot-password');
    },
    async getReset(req, res, next) {
        const {
            token
        } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        });

        if (!user) {
            req.session.error = 'Password token is invalid\expired'
            return res.redirect('/forgot-password')
        }

        res.render('users/reset', {
            token
        })
    },
    async putReset(req, res, next) {
        const {
            token
        } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        });

        if (!user) {
            req.session.error = 'Password token is invalid\expired';
            return res.redirect('/forgot-password');
        }

        if (req.body.password === req.body.confirm) {
            await user.setPassword(req.body.password);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            const login = util.promisify(req.login.bind(req));
            await login(user);
        } else {
            req.session.error = 'Passwords do not match'
            return res.redirect(`/reset/${token}`);
        }


        const msg = {
            to: user.email,
            from: 'Surf Shop Admin <doyouthinkyouknowha@email.com>',
            subject: 'Surf Shop - Password Changed',
            text: `Hello,
              This email is to confirm that the password for your account has just been changed.
              If you did not make this change, please hit reply and notify us at once.`.replace(/                  /g, '')
        };
        await sgMail.send(msg);
        req.session.success = 'Password successfully updated!';
        res.redirect('/');

    }
};