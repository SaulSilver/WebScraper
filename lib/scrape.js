/**
 * Created by hatem on 2016-11-06.
 */
"use strict";

let cheerio = require('cheerio');
let rp = require('request-promise');
var linksArray = [];
/**
 * Extract the absolute links
 * @param urls
 */
let extractLinks = function (urls) {
    let promises = [];
    let options = {
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    //Collect request promises
    urls.forEach(function (url) {
        options.uri = url;
        promises.push(rp(options));
    });

    //Wait for promises to resolve or reject
    return Promise.all(promises).then(function (value) {
        value.forEach(function ($) {
            $('a').filter(function () {
                var nextUrl = $(this).attr('href');
                console.log(nextUrl);
                value.replace('/weekend', nextUrl);
                linksArray.push(value);
            });
        });

        return Promise.resolve(extractLinks(linksArray));
    });
};

module.exports = {
    extractLinks
};