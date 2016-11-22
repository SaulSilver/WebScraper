/**
 * Created by hatem on 2016-11-06.
 */
"use strict";

const cheerio = require('cheerio');
const rp = require('request-promise');
const http = require('request-promise-json');

/**
 * Extract the links in home page
 */
let extractHomeLinks = function(url) {
    let linksArray = [];

    let options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return rp(options)
        .then(function ($) {
            $('a').filter(function () {
                let nextUrl = $(this).attr('href');
                let fullUrl = url.substring(0, url.lastIndexOf('/')) + nextUrl;
                linksArray.push(fullUrl);
            });
            return Promise.resolve(linksArray);
        })
        .catch(function (err) {
            console.log(err);
        });
};

/**
 * Extracts the links from the calendar page
 */
let extractCalendar = function (url) {
    let linksArray = [];

    let options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return rp(options)
        .then(function ($) {
            $('a').filter(function () {
                let nextUrl = $(this).attr('href');
                let fullUrl = url + '/' + nextUrl;
                linksArray.push(fullUrl);
            });
            return Promise.resolve(linksArray);
        })
        .catch(function (err) {
            console.log(err);
        });
};

/**
 * Read the days for each person of the three and decide which days are available if there are any exist
 * @param peopleArray
 */
function readDays(peopleArray) {
    let promises = [];      // An array of promises
    let daysArray = [];         // The array that holds all the days

    // Days counter
    let fridayCounter = 0;
    let saturdayCounter = 0;
    let sundayCounter = 0;

    let availableDays = [];       // An array that holds the days when everyone is available

    let options = {
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    // An iteration for each person in the people array to check the days
    peopleArray.forEach(function (url) {
            options.uri = url;

            promises.push(rp(options)
                .then(function ($) {
                    $('td').filter(function () {
                        let availability = $(this).text();      // Gets the day

                        // Only do the following the day is available
                        if (availability.toUpperCase() === 'OK') {
                            let day = $(this).closest('table').find('th').eq($(this).index()).text();
                            daysArray.push(day);

                            //Decide on which day where everyone is available
                            if (day.toLowerCase() === 'friday')
                                fridayCounter++;
                            else if (day.toLowerCase() === 'saturday')
                                saturdayCounter++;
                            else if (day.toLowerCase() === 'sunday')
                                sundayCounter++;

                            //If a day occurs three times in the array then everyone is available on that day
                            if (fridayCounter === 3) {
                                availableDays.push('Friday');
                                fridayCounter = 0;
                            }
                            if (saturdayCounter === 3) {
                                availableDays.push('Saturday');
                                saturdayCounter = 0;
                            }
                            if (sundayCounter === 3) {
                                availableDays.push('Sunday');
                                sundayCounter = 0;
                            }
                        }
                    });
                })
                .catch(function (err) {
                    console.log(err);
                }))
        }
    );
    return Promise.all(promises).then(function (daysArray) {
        return availableDays;
    });
}

/**
 * Read the cinema page html page and retrieve the movies names
 * @param cinemaLink
 */
function openCinemaPage(cinemaLink) {
    let value;              //Value of the movie in html page
    let moviesList = [];        //List of the 3 movies
    console.log('wow')
    let options = {
        uri: cinemaLink,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return rp(options)
        .then(function ($) {
            $('option').filter(function () {
                value = $(this).attr('value');
                if(value === '01' || value === '02' || value === '03') {
                    moviesList.push($(this).text());
                }
            });
            return Promise.resolve(moviesList);
        }).catch(function (err) {
            console.log(err);
        });

}

/**
 *  To check the available movies on the available days
 * @param availableDays
 */
function checkMovie(availableDays, moviesList) {
    let dayNumber = '0';        // For the day in the http request
    let movieTimes = [];              // The movie time that is available
    let movieCounter = ['01', '02', '03'];           // Counter for the movie uri
    let availableMovies = [];           // An array to keep the available movies and their showing times
    let movieName;                  // The name of the movie
    let promises = [];

    //TODO: Check all the three movies (currently you check only one)
    availableDays.forEach(day => {

        if (day.toLowerCase() === 'friday')
            dayNumber += '5';
        else if (day.toLowerCase() === 'saturday')
            dayNumber += '6';
        else if (day.toLowerCase() === 'sunday')
            dayNumber += '7';


        let options = {
            qs: {
                access_token: 'xxxxx xxxxx'
            },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        };

        function Movie() {

        }

        // Check every movie
        movieCounter.forEach(function (movieNumber) {
            options.uri = 'http://vhost3.lnu.se:20080/cinema/check?day=' + dayNumber + '&movie=' + movieNumber;

            promises.push(rp(options)
                .then(function (resultJSON) {
                    //Check which time is available to be booked
                    for(let i = 0; resultJSON.length > i; i++) {
                        let movieShowTime = resultJSON[i];

                        if (movieShowTime['status'] === 1) {
                            movieTimes.push(movieShowTime['time']);

                            //Pick the movie name depending on its number
                            movieName = movieShowTime['movie'];

                            if(movieName === '01')
                                movieName = moviesList[0];
                            else if ( movieName === '02')
                                movieName = moviesList[1];
                            else if ( movieName === '03')
                                movieName = moviesList[2];
                        }
                    }
                    // Add the available movie times and name to the movie object and put it in the available times and movies array
                    if (movieTimes.length !== 0) {
                        let movie = new Movie();
                        movie['movieTimes'] = movieTimes;
                        movieTimes = [];
                        movie['movieName'] = movieName;
                        movie['day'] = day;
                        availableMovies.push(movie);
                    }
                })
                .catch(function (err) {
                    console.error(err);
                })
            );
        });
    } );
    return Promise.all(promises).then(function () {
        return availableMovies;
    })
}


module.exports = {
    extractHomeLinks,
    extractCalendar,
    readDays,
    openCinemaPage,
    checkMovie,
};