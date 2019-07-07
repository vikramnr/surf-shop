const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer({
    dest: 'uploads/'
})
const Post = require('../models/post')
const {
    asyncErrorHandler
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
router.get('/new', asyncErrorHandler(postNew));

//get one particular post
router.get('/:id', asyncErrorHandler(postShow));

// Edit one post
router.get('/:id/edit', asyncErrorHandler(postEdit));

// save the post
router.post('/', upload.array('images', '4'), asyncErrorHandler(postCreate));

// update a post
router.put('/:id', upload.array('images', '4'), asyncErrorHandler(postUpdate));


// delete a post
router.delete('/:id', asyncErrorHandler(postDelete));

module.exports = router;