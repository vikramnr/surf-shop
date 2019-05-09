const express = require('express');
const router = express.Router({
    mergeParams: true
});


// GET review index
router.get('/', (req, res, next) => {
    res.send('/reviews')
});

// create a new review
// router.get('/new', (req, res, next) => {
//     res.send('/reviews/new')
// });

//get one particular review
router.get('/:review_id', (req, res, next) => {
    res.send('/show/review')
});

// save the review
router.post('/', (req, res, next) => {
    res.send('post review')
})

// Edit one review
router.get('/:review_id/edit', (req, res, next) => {
    res.send('edit/reviews')
});

// update a review
router.put('/:review_id', (req, res, next) => {
    res.send('update /reviews')
});

// delete a review
router.delete('/:review_id', (req, res, next) => {
    res.send('delet /reviews')
});


module.exports = router;