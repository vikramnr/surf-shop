const express = require('express');
const router = express.Router({mergeParams: true});

const {
    asyncErrorHandler,
    isReviewAuthor
} = require('../middleware/index');

const {
    reviewCreate,
    reviewDelete,
    reviewUpdate
} = require('../controllers/review');

// save the review
router.post('/',asyncErrorHandler(reviewCreate));

// update a review
router.put('/:review_id',isReviewAuthor , asyncErrorHandler(reviewUpdate));

// delete a review
router.delete('/:review_id', isReviewAuthor, asyncErrorHandler(reviewDelete));


module.exports = router;