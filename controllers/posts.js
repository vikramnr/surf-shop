const Post = require('../models/post');
const clodinary = require('cloudinary');
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
        let post = await Post.create(req.body.post);
        res.redirect(`/posts/${post._id}`);
    },
    async postShow(req, res, next) {
        let post = await Post.findById(req.params.id);
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
        post.title = req.body.post.title
        post.description = req.body.post.description
        post.price = req.body.post.price
        post.location = req.body.post.location
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