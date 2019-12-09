const Review = require('../models/review');
const User = require('../models/user');
const Post = require('../models/post');
const {
	cloudinary
} = require('../cloudinary/index');

const middleware = {
	asyncErrorHandler: (fn) =>
		(req, res, next) => {
			Promise.resolve(fn(req, res, next))
				.catch(next);
		},
	isReviewAuthor: async (req, res, next) => {
		let review = await Review.findById(req.params.review_id);
		if (review.author.equals(req.user._id)) {
			return next();
		}
		// req.session.error ='unauthorized request'
		res.redirect('/')
	},
	isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()) return next();
		req.session.error = 'You need to be logged in to do that!';
		req.session.redirectTo = req.originalUrl;
		res.redirect('/login');
	},
	isAuthor: async (req, res, next) => {
		const post = await Post.findById(req.params.id);
		console.log(req.user)
		if (post.author.equals(req.user._id)) {
			res.locals.post = post;
			return next()
		}
		req.session.error = 'Access denied';
		res.redirect('back');
	},
	isValidPassword: async (req, res, next) => {
		const {
			user
		} = await User.authenticate()(res.locals.username.username, req.body.currentPassword);

		if (user) {
			res.locals.authuser = user;
			next();
		} else {
			middleware.deleteProfileImage(req);
			req.session.error = 'Invalid current password';
			return res.redirect('back');
		}
	},
	changePassword: async (req, res, next) => {
		const {
			newPassword,
			passwordConfirmation
		} = req.body;
		if (newPassword && !passwordConfirmation) {
			middleware.deleteProfileImage(req);
			res.session.error = 'Please confirm your new password';
			return res.redirect('back');
		} else if (newPassword && passwordConfirmation) {
			const {
				authuser
			} = res.locals.authuser;
			if (newPassword === passwordConfirmation) {
				await user.setPassword(newPassword);
				next();
			} else {
				middleware.deleteProfileImage(req);
				res.session.error = 'Mismatch between new password & confirmation password';
				return res.redirect('back');
			}
		} else {
			next();
		}

	},
	deleteProfileImage: async req => {
		if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
	}


}

module.exports = middleware;