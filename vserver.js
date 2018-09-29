var express = require('express');
var app = express();
app.use(express.static('.'));

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "54321",
    database: "shppcalendly"
});

var DAYS_FOR_SEARCH = 7;

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(function(req, res, next) {
    if (req.url == '/') {
        res.sendFile(__dirname + '/visitor.html');
    }
    else next();
});

app.get('/user/:eventsAdmin', function(req, res, next) {
    var usr = req.params.eventsAdmin;
    var patterns = [];
    con.query('select * from users left join eventpattern using (userId) where users.login = ?;', usr,
        function (err, results, fields) {
        if (err)
            throw err;
        var event = {};
        results.forEach(function (entry) {
            event.userId = entry.userId;
            event.patternId = entry.patternId;
            event.type = entry.type;
            event.number = entry.number;
            event.duration = entry.duration;
            event.description = entry.description;
            patterns.push(event);
        });
        usrId = event.userId;
        res.render('index', patterns);
        // res.end(JSON.stringify(patterns));
    });
});

app.get('/userWeek/:eventsAdmin/:dweek', function(req, res, next) {
    var usr = req.params.eventsAdmin;
    var dweek = req.params.dweek;
    var conditions = [usr, dweek, dweek, DAYS_FOR_SEARCH];
    var events = [];
    con.query('select * from eventslist ' +
        'join eventpattern on eventslist.patternId = eventpattern.patternId ' +
        'join users on eventpattern.userId = users.userId ' +
        ' where users.login = ? and eventslist.date >= ? and (datediff(eventslist.date, ?) <= ?);',
        conditions, function (err, results, fields) {
            if (err)
                throw err;
            var event = {};
            results.forEach(function (entry) {
                event.userId = entry.userId;
                event.patternId = entry.patternId;
                event.type = entry.type;
                event.number = entry.number;
                event.duration = entry.duration;
                event.description = entry.description;
                event.date = entry.date;
                event.time = entry.time;
                events.push(event);
            });
            usrId = event.userId;
            res.end(JSON.stringify(events));
        });
});

app.post('/visitor', jsonParser, function (req, res) {
    var vname = req.body.vname;
    var vemail = req.body.vemail;
    var visitor = [vname, vemail, vname, vemail];

    con.query('insert into visitors (name, email) select * from (select ?, ?) as tmp ' +
        'where not exists(select * from visitors where name = ? and email = ?) limit 1;', visitor, function (err, results, fields) {
        if (err) throw err;
        if (results.insertId == 0)
            con.query('select * from visitors where name = ? and email = ?;', visitor, function (err, results, fields) {
                if (err) throw err;
                vstrId = results[0].visitorId;
            });
        else
            vstrId = results.insertId;
    });
});

app.listen(8255);