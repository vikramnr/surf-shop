const express = require('express');
const router = express.Router();
const multer = require('multer')
const {
    cloudinary,
    storage
} = require('../cloudinary');

const upload = multer({
    storage
});

const Post = require('../models/post')
const {
    asyncErrorHandler,
    isLoggedIn,
    isAuthor
} = require('../middleware/index');
const {
    indexPosts,
    postNew,
    postCreate,
    postShow,
    postEdit,
    postUpdate,
    postDelete
} = require('../controllers/posts');
/* GET post index /posts */
router.get('/', asyncErrorHandler(indexPosts));

// create a new post
router.get('/new', isLoggedIn, asyncErrorHandler(postNew));

//get one particular post
router.get('/:id', asyncErrorHandler(postShow));

// Edit one post
router.get('/:id/edit',isLoggedIn ,asyncErrorHandler(isAuthor), postEdit);

// update a post
router.put('/:id', isLoggedIn,asyncErrorHandler(isAuthor), upload.array('images', '4'), asyncErrorHandler(postUpdate));

// delete a post
router.delete('/:id', isLoggedIn,asyncErrorHandler(isAuthor), asyncErrorHandler(postDelete));


// save the post
router.post('/', isLoggedIn, upload.array('images', '4'), asyncErrorHandler(postCreate));




module.exports = router;