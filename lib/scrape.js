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
                console.log(fullUrl);
                linksArray.push(fullUrl);
            });
            Promise.resolve(readDays(linksArray));
        })
        .catch(function (err) {
            console.log(err);
        });
};

/**
 * Read the days for each person of the three
 * @param peopleArray
 */
function readDays(peopleArray) {
    let daysArray = [];

    for(let i = 0; i < peopleArray.length; i++) {
        let options = {
            uri: peopleArray[i],
            transform: function (body) {
                return cheerio.load(body);
            }
        };

        rp(options)
            .then(function ($) {
                $('td').filter(function () {

                    let availability = $(this).text();

                    if(availability.toUpperCase() === 'OK') {
                        let $th = $(this).closest('table').find('th').eq($(this).index());
                        console.log($th.text());
                        daysArray.push($th.text());
                    }
                });
                Promise.resolve(daysArray);
            })
            .catch(function (err) {
                console.log(err);
            });
    }
}

/**
 *  Decide which day all the people are available on
 * @param daysArray
 */
function decideDay(daysArray) {
    // Days counter
    let fridayCounter = 0;
    let saturdayCounter = 0;
    let sundayCounter = 0;

    let suggestedDays = [];     // An array that holds the days when everyone is available

    daysArray.forEach(function (day) {
        if (day === 'Friday')
            fridayCounter++;
        else if (day === 'Saturday')
            saturdayCounter++;
        else if (day === 'Sunday')
            sundayCounter++;
    });

    if (fridayCounter === 3)
        suggestedDays.push('Friday');
    if (saturdayCounter === 3)
        suggestedDays.push('Saturday');
    if (sundayCounter === 3)
        suggestedDays.push('Sunday');
    else {
        //TODO: Show Message to user that there are no free days
        //cheerio.load('index.html')
        return;
    }
    return suggestedDays;
}

module.exports = {
    extractHomeLinks,
    extractCalendar
};