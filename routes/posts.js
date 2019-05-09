const express = require('express');
const router = express.Router();

/* GET post index /posts */
router.get('/', (req, res, next) => {
    res.send('/posts')
});

// create a new post
router.get('/new', (req, res, next) => {
    res.send('/posts')
});

//get one particular post
router.get('/:id', (req, res, next) => {
    res.send('/posts')
});

// Edit one post
router.get('/:id/edit', (req, res, next) => {
    res.send('/posts')
});

// save the post
router.post('/', (req, res, next) => {
    res.send('/posts')
});

// update a post
router.put('/:id', (req, res, next) => {
    res.send('/posts')
});

// delete a post
router.delete('/:id', (req, res, next) => {
    res.send('/posts')
});

module.exports = router;