/**
 * Created by hatem on 2016-11-06.
 */
"use strict";

const bodyParser = require('body-parser');
const express = require('express');
const exphbs = require('express3-handlebars');
const scrape = require('./lib/scrape.js');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');

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

    let whatdoiget = scrape.extractHomeLinks(input)
        .then(function (linksArray) {
            homeLinksArray = linksArray;
            return scrape.extractCalendar(linksArray[0]);
        })
        .then(function (peopleArray) {
            return scrape.readDays(peopleArray);
        })
        .then(function (availableDays) {
            if (availableDays.length === 0)
            //TODO: check if there are no days available then send a message to the user about that
                alert('No days are available');
            freeDays = availableDays;
            return scrape.openCinemaPage(homeLinksArray[1])
        })
        .then(function (moviesList) {
            return scrape.checkMovie(freeDays, moviesList);
        })
        .then(function (availableMovies) {
            movies = availableMovies;
            movies.forEach(object => {
               //console.log(object)
            });
            return scrape.getRestaurantLogin(homeLinksArray[2]);
        })
        .then(function (loginLink) {
            console.log(loginLink);
            return scrape.restaurantLogin(loginLink, movies);
        });
});
