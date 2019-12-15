const Review = require('../models/review');
const User = require('../models/user');
const Post = require('../models/post');
const {
	cloudinary
} = require('../cloudinary/index');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({
	accessToken: process.env.MAPBOX_TOKEN
});
const mapboxToken = process.env.MAPBOX_TOKEN;

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	// $& means the whole matched string
}


const middleware = {
	asyncErrorHandler: (fn) =>
		(req, res, next) => {
			console.log('insider me');
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
	},
	searchAndFilter : async (req, res, next) => {
		console.log('insider me+dhakshaksjhkj');
		let queryKeys = Object.keys(req.query);
		if (queryKeys.length) {
			let dbQuery = [];
			let {
				search,
				price,
				avgRating,
				location,
				distance
			} = req.query;
			if (search) {
				search = new RegExp(escapeRegExp(search), 'gi');
				dbQuery.push({
					$or: [{
							title: search
						},
						{
							location: search
						},
						{
							description: search
						},
					]
				})
			}
			if (location) {
				let coordinates;

				try {
					if (typeof JSON.parse(location) === 'number') {
						throw new Error;
					}
					location = JSON.parse(location);
					coordinates = location;
				} catch (err) {
					let resp = await geocodingClient.forwardGeocode({
						query: location,
						limit: 1
					}).send();
					coordinates = resp.body.features[0].geometry.coordinates;
				}

				let maxDistance = distance || 25;
				maxDistance *= 1609.34;
				dbQuery.push({
					geometry: {
						$near: {
							$geometry: {
								type: 'Point',
								coordinates
							},
							$maxDistance: maxDistance
						}
					}
				});
			}
			if (price) {
				if (price.min) dbQuery.push({
					price: {
						$gte: price.min
					}
				});
				if (price.max) dbQuery.push({
					price: {
						$lte: price.max
					}
				});

			}
			if (avgRating) {
				dbQuery.push({
					avgRating: {
						$in: avgRating
					}
				});

			}
			console.log(dbQuery);
			res.locals.dbQuery = dbQuery.length ? {
				$and: dbQuery
			} : {};
		}
		res.locals.query = req.query;
		queryKeys.splice(queryKeys.indexOf('page'), 1);
		let demlimter = queryKeys.length ? '&' : '?'
		res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${demlimter}page=`;
		next();
	}
}

module.exports = middleware;