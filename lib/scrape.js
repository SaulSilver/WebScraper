/**
 * Created by hatem on 2016-11-06.
 */
"use strict";

let cheerio = require('cheerio');
let rp = require('request-promise');

module.exports = {
    extractLinks
};

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
        var urlSet = new Set();

        value.forEach(function ($) {
            $('a').filter("[href^='http://'],[href^='https://']")
                .map(function (index, link) {
                    urlSet.add($(link).attr('href'));
                });
        });

        return Promise.resolve(urlSet);
    });
};