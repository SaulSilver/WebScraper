/**
 * Created by hatem on 2016-11-06.
 */
"use strict";

let cheerio = require('cheerio');
let rp = require('request-promise');
let linksArray = [];

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
                console.log(fullUrl);
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

    peopleArray.forEach(function (url) {
            options.uri = url;

            promises.push(rp(options)
                .then(function ($) {
                    $('td').filter(function () {
                        let availability = $(this).text();

                        if (availability.toUpperCase() === 'OK') {
                            let day = $(this).closest('table').find('th').eq($(this).index()).text();
                            //console.log(day);
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


module.exports = {
    extractHomeLinks,
    extractCalendar,
    readDays
};