const mongoose = require('mongoose');
const Review = require('./review');
const mongoosePaginate = require('mongoose-paginate')
const postSchema = new mongoose.Schema({
    title: String,
    price: String,
    description: String,
    images: [{
        url: String,
        public_id: String
    }],
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    properties: {
        description: String
    },
    // coordinates: Array,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    avgRating: {
        type: Number,
        default: 0
    }
});

postSchema.pre('remove', async function() {
    await Review.remove({
        _id: {
            $in: this.reviews
        }
    })
})

postSchema.methods.calculateAvgRating = function() {
    let ratingsTotal = 0;
    if (this.reviews.length) {
        this.reviews.forEach((review) => ratingsTotal += review.rating);
        this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
        const floorRating = Math.floor(this.avgRating);
        this.save();
        return floorRating;
    }

}

postSchema.plugin(mongoosePaginate);
postSchema.index({geometry:'2dsphere'})
module.exports = mongoose.model('Post', postSchema)