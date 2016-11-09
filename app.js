/**
 * Created by hatem on 2016-11-06.
 */

var bodyParser = require('body-parser');
var express = require('express');
var exphbs = require('express3-handlebars');

var app = express();

// tell express which template engine to use
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// tell express where static resources are
// the index.html is the start page
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(app.get('port'), () => {
    console.log('Welcome to http://localhost:' + app.get('port'));
});

//var startButton = document.getElementById('start_button');
//startButton.addEventListener('click', startScraping);


function startScraping() {
    let input = document.getElementById('user_url').value;
    console.log(input);
}