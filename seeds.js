const faker = require('faker');
const Post = require('./models/post');
const cities = require('./cities');

async function seedPosts() {
	//await Post.remove({});
	await Post.deleteMany({});
	for (const i of new Array(600)) {
		const random1000 = Math.floor(Math.random() * 1000);
		const random5 = Math.floor(Math.random() * 6);

		const title = faker.lorem.word();
		const description = faker.lorem.text();
		const postData = {
			title,
			description,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude],
			},
			author: '5dd93920a597170a482349ae',
			images: [{
				url: 'https://res.cloudinary.com/devsprout/image/upload/v1561315599/surf-shop/surfboard.jpg'
			}],
			price: random1000,
			avgRating: random5
		}
		let post = new Post(postData);
		post.properties.description = `<strong><a href="/posts/${post._id}">${title}</a></strong><p>${post.location}</p><p>${description.substring(0, 20)}...</p>`;
		await post.save();
	}
	console.log('600 new posts created');
}

module.exports = seedPosts;

//5d49ada32e44681bd8e4aaa8

// // {"_id":"5ddffa38f443f31b708fa2fd","username":"test","email":"test@test.com","image":"","salt":"b1b9a6d3271f44c155c0e0e86cf1bda566141594b78f48ba6dbd04ec1ff2be61","hash":"9e4ba913fbac8774fc6ac9a4e2d2883df1b50d7afaa08a0b25a3cc6b63c4638cc00588b3d87ab1b58812392380d5275f2839255f93a3b27486a2c3d9612e9d60a35126aaddc898c6568c9673108431f5289a78b3bc923317271b406759158a032487ab60149944ca306d8b136208d44d1ba7a927fc76f37ce9773683acdce2a76f30270d6ef4d0ac63e430c9fbe3b5e194613ceaa9423c44f59f1d1197c2fa4f02016f5fdf5dc34f1040deaf76b8692db23e449190a5900c391c7a80ddf40248a87a7720fb1f72b7c83912a3d5a8260a6cf1fc6a4f4cec5a711f86c26483979c582bb8502666459676d5dec52b7abca7de26dec638e5d88db589f9f84aafe401f7bec022f9884075448f09149f1c2b709b0b3955d98f96d1cd6c82ab190ae27bc3bad9d2d72206cf1147ae45e15e0f05fee26cc28b0ea81b13f3a3f323d591a5600dd5abb0cd9882aadcc836b4a9264f6f3ca0b79290e7f8ea75dd43a25fccdee74ab3a8ec824f3c4dfae306a7304a2a82ea4278b264c2bcbc949c6276d2608046228ab53242955be32b02aabd98ea628d71cd61f3bccab48aa9310d5240b566698f0159582e5fe3898a0069a4d23caf31cc24c91e6d1272614d3b814fab561573eed64c4c922f2e34e4f9e07ad210508da8d5be98ac2587791b0a5b5c41468a14dbdc52b3b04701805dec897caffd355f3a8224f8529a138795e9a670d2eae6","__v":0}