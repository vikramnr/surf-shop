const Post = require('../models/post');
const clodinary = require('cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAPBOX_TOKEN
});
clodinary.config({
    cloud_name: 'dg6pzjhcw',
    api_key: '616768382369741',
    api_secret: 'GFscWk-G63Xx2BbGBRAAubGP12k'
})
module.exports = {
    async indexPosts(req, res, next) {
        let posts = await Post.find({});
        res.render('posts/index', {
            posts
        });
    },
    postNew(req, res, next) {
        res.render('posts/new')
    },
    async postCreate(req, res, next) {
        req.body.post.images = []
        for (const file of req.files) {
            let image = await clodinary.v2.uploader.upload(file.path);
            req.body.post.images.push({
                url: image.secure_url,
                public_id: image.public_id
            })
        }
        let resCoding = await geocodingClient.forwardGeocode({
                query: req.body.post.location,
                limit: 1
            })
            .send();
        req.body.post.coordinates = resCoding.body.features[0].geometry.coordinates
        let post = await Post.create(req.body.post);
        req.session.success = 'Post created'
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
            populate:{
                path: 'author',
                model: 'User'
            }
        });
        res.render('posts/show', {
            post
        })
    },
    async postEdit(req, res, next) {
        let post = await Post.findById(req.params.id);
        res.render('posts/edit', {
            post
        })
    },
    async postUpdate(req, res, next) {
        let post = await Post.findById(req.params.id);
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
                let image = await clodinary.v2.uploader.upload(file.path)
                post.images.push({
                    url: image.secure_url,
                    public_id: image.public_id
                })
            }
        }
        if (req.body.post.location !== post.location) {
            let resCoding = await geocodingClient.forwardGeocode({
                    query: req.body.post.location,
                    limit: 1
                })
                .send();
            post.coordinates = resCoding.body.features[0].geometry.coordinates
            post.location = req.body.post.location
        }

        post.title = req.body.post.title
        post.description = req.body.post.description
        post.price = req.body.post.price
        post.save();
        res.redirect(`/posts/${post.id}`);
    },
    async postDelete(req, res, next) {
        let post = await Post.findById(req.params.id)
        for (const image of post.images) {
            await clodinary.v2.uploader.destroy(image.public_id);
        }
        await post.remove();
        res.redirect('/posts');
    }


};