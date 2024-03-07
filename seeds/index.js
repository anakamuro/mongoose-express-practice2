const mongoose = require('mongoose');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers')
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
  console.log('MongoDB Connection OK!!!')
})
.catch(err=> {
    console.log('MongoDB Connection error!!!');
    console.log(err);
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
   for(let i = 0; i < 50; i++){
    const randomCityIndex = Math.floor(Math.random() * cities.length);
    const camp = new Campground({
        location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
        title: `${sample(descriptors)} . ${sample(places)}`
    });
    await camp.save();
   }
}

seedDB().then(() => {
    mongoose.connection.close();
})