/**
 * Created by hatem on 2016-11-06.
 */
"use strict";

const bodyParser = require('body-parser');
const express = require('express');
const exphbs = require('express3-handlebars');
const scrape = require('./lib/scrape.js');

const app = express();

let homeLinksArray = [];        //An array that holds the main links
let freeDays = [];
let movies = [];

// tell express which template engine to use
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
    extended: true
}));

// tell express where static resources are
// the index.html is the start page
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), () => {
    console.log('Welcome to http://localhost:' + app.get('port'));
});

app.post('/', (req, res) => {
    let input = req.body.userUrl;

    scrape.extractHomeLinks(input)              //Get the links from home page
        .then(function (linksArray) {            //Get the list of people in the /calendar page
            homeLinksArray = linksArray;
            return scrape.extractCalendar(linksArray[0]);
        })
        .then(function (peopleArray) {          //Check the available days for each person
            return scrape.readDays(peopleArray);
        })
        .then(function (availableDays) {                //Open the /cinema page and get the movies list
            if (availableDays.length === 0)
                console.log('No days are available');
            freeDays = availableDays;
            return scrape.openCinemaPage(homeLinksArray[1])
        })
        .then(function (moviesList) {                       //Check which movies are available for the specific days
            return scrape.checkMovie(freeDays, moviesList);
        })
        .then(function (availableMovies) {          //Retrieve the restaurant login
            movies = availableMovies;
            return scrape.getRestaurantLogin(homeLinksArray[2]);
        })
        .then(function (loginLink) {                //Decide on which time to go to the restaurant (final suggestions are made here)
            return scrape.restaurantLogin(loginLink, freeDays, movies);
        }).then(function(suggestion) {
        console.log(suggestion);})
        .catch(function (err) {
            console.error(err);
        });
});
