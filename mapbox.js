require('dotenv').config()
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAPBOX_TOKEN
});

async function geocodingCoder() {
    try {
        let res = await geocodingClient.forwardGeocode({
                query: 'Lahore, Pakistan',
                limit: 1
            })
            .send();
        console.log(res.body.features[0].geometry)
    } catch (err) {
        console.log(err.message);
    }

}


geocodingCoder()

// console.log(match.features[0].geometry);