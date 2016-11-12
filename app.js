/**
 * Created by hatem on 2016-11-06.
 */
"use strict";

const bodyParser = require('body-parser');
const express = require('express');
const exphbs = require('express3-handlebars');
var scrape = require('./lib/scrape.js');
const app = express();

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
    var input = req.body.userUrl;
    console.log(input);
    scrape.extractLinks(new Array(input));
});
