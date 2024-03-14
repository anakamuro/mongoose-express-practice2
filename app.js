const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate')
const {campgroundSchema} = require('./schemas');
const methodOverride = require('method-override');
const Campground = require("./models/campground");

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
  console.log('MongoDB Connection OK!!!')
})
.catch(err=> {
    console.log('MongoDB Connection error!!!');
    console.log(err);
})

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
//that code is necessary for form

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground})
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Wrong campground data', 400)
   
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}))
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'my yard', description: 'reasonable camp!!'});
//     await camp.save()
//     res.send(camp)
// })

app.all('*', (req, res, next) => {
    next(new ExpressError('I could not find the page', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500, message = 'Problem occured'} = err;
    res.status(statusCode).render('error', {err});
    if(!err.message){
        err.message = "Problem occured"
    }
});

app.listen(3000, () => {
    console.log('Waiting in port 3000....')
})