const Post = require('../models/post');
const clodinary = require('cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAPBOX_TOKEN
});

const mapboxToken = process.env.MAPBOX_TOKEN;
const {
    cloudinary
} = require('../cloudinary');

module.exports = {
    async indexPosts(req, res, next) {
        let posts = await Post.paginate({}, {
            page: req.query.page || 1,
            limit: 10,
            sort: '-_id'
        });
        posts.page = Number(posts.page)
        res.render('posts/index', {
            posts,
            mapboxToken
        });
    },
    postNew(req, res, next) {
        res.render('posts/new')
    },
    async postCreate(req, res, next) {
        req.body.post.images = []
        for (const file of req.files) {
            req.body.post.images.push({
                url: file.secure_url,
                public_id: file.public_id
            });
        }
        let resCoding = await geocodingClient.forwardGeocode({
                query: req.body.post.location,
                limit: 1
            })
            .send();
        req.body.post.geometry = resCoding.body.features[0].geometry;
        req.body.post.author = req.user._id;
        let post = new Post(req.body.post);
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p>
        <p>${post.description.substring(0, 20)}...</p>`;
        await post.save();
        res.redirect(`/posts/${post._id}`);
    },
    async postShow(req, res, next) {
        //throw new Error('An error occurred. Please contact your')
        let post = await Post.findById(req.params.id).populate({
            path: 'reviews',
            options: {
                sort: {
                    '_id': -1
                }
            },
            populate: {
                path: 'author',
                model: 'User'
            }
        });
        const floorRating = post.calculateAvgRating();
        res.render('posts/show', {
            post,
            mapboxToken,
            floorRating
        })
    },
    postEdit(req, res, next) {
        res.render('posts/edit')
    },
    async postUpdate(req, res, next) {
        const {
            post
        } = res.locals;

        if (req.body.deleteImages && req.body.deleteImages.length) {
            let deleteImages = req.body.deleteImages;
            for (const public_id of deleteImages) {
                await clodinary.v2.uploader.destroy(public_id);
                for (const image of post.images) {
                    if (image.public_id === public_id) {
                        let idx = post.images.indexOf(image);
                        post.images.splice(idx, 1);
                    }
                }
            }
        }
        if (req.files) {
            for (const file of req.files) {
                req.body.post.images.push({
                    url: file.secure_url,
                    public_id: file.public_id
                });
            }
        }
        if (req.body.post.location !== post.location) {
            let resCoding = await geocodingClient.forwardGeocode({
                    query: req.body.post.location,
                    limit: 1
                })
                .send();
            post.geometry = resCoding.body.features[0].geometry;
            post.location = req.body.post.location
        }

        post.title = req.body.post.title
        post.description = req.body.post.description
        post.price = req.body.post.price
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p>
        <p>${post.description.substring(0, 20)}...</p>`;
        await post.save();
        res.redirect(`/posts/${post.id}`);
    },
    async postDelete(req, res, next) {
        const { post } = res.locals;
        for (const image of post.images) {
            await clodinary.v2.uploader.destroy(image.public_id);
        }
        await post.remove();
        res.redirect('/posts');
    }


};