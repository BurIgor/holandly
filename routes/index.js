var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "7B0fb6967",
    database: "holandly"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("DB connected!");
});

var DAYS_FOR_SEARCH = 7;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/user/:userName', function (req, res, next) {
    var usr = req.params.userName;
    var patterns = [];
    con.query('select distinct type, description from eventpattern ' +
        'left join users on eventpattern.userId = users.userId ' +
        'join eventslist on eventpattern.patternId = eventslist.patternId and eventslist.date >= curdate() ' +
        'where users.login = ?;',
        usr, function (err, results, fields) {
            if (err) throw err;
            results.forEach(function (entry) {
                patterns.push({event: entry.type, description: entry.description});
            });
            res.render('index', {username: usr, patterns: patterns});
        });
});

router.get('/user/:userName/:eventType', function (req, res, next) {
    var usr = req.params.userName;
    var eventType = req.params.eventType;
    con.query('select userId from users where login = ?', usr, function (err, results, fields) {
        if (err) throw err;
        if (results.length == 0) res.render('index', {description: '', duration: 0, dates: []});
        else {
            var conditions = [results[0].userId, eventType, DAYS_FOR_SEARCH];
            con.query('select e.date, p.number, p.description, p.duration, count(v.visitorId) as amount from eventslist e ' +
                'left join eventpattern p on p.patternId = e.patternId ' +
                'left join eventvisitors v on v.eventId = e.eventId  ' +
                'where p.userId = ? and p.type = ? and e.date >= curdate() and (datediff(e.date, curdate()) <= ?) ' +
                'group by e.eventId order by e.date;',
                conditions, function (err, rslts, fields) {
                    if (err) throw err;
                    var days = [];
                    var dayCur = new Date();
                    function dateFormat(dt) {
                        var dd = dt.getDate() < 10 ? '0'+dt.getDate() : dt.getDate();
                        var mm = dt.getMonth() + 1;
                        mm = mm < 10 ? '0'+mm : mm;
                        return dd + '/' + mm + '/' + dt.getFullYear();
                    } 
                    for (var i = 0; i < DAYS_FOR_SEARCH; i++) {
                        days.push({date: dateFormat(dayCur), available: false});
                        dayCur.setDate(dayCur.getDate() + 1);
                    }
                    rslts.forEach(function (entry) {
                        if (entry.number - entry.amount > 0) {
                            for (var i = 0; i < DAYS_FOR_SEARCH; i++) {
                                if (dateFormat(entry.date) != days[i].date) continue;
                                days[i].available = true;
                                break;
                            }
                        }
                    });
                    res.render('timepicker', {days: days});
                });
        }
    });
});

router.get('/events/:userName/:eventType', function (req, res, next) {
    var conditions = [req.params.userName, req.params.eventType];
    con.query('select * from eventslist ' +
        'left join eventpattern on eventpattern.patternId = eventslist.patternId ' +
        'join users on eventpattern.userId = users.userId ' +
        'where users.login = ? and eventpattern.type = ? and eventslist.date >= curdate();',
        conditions, function (err, results, fields) {
            if (err) throw err;
            var events = [];
            results.forEach(function (entry) {
                events.push(entry.date);
            });
            res.render('index', {event: results[0].type, description: results[0].description,
                duration: results[0].duration, data: events});
        });
});

// modelling post-queries as get-queries
router.get('/getWeek/:date/:patternId', function (req, res, next) {
    var dateArray = req.params.date.split('-');
    var gottenDate = dateArray[2] + "-" + dateArray[1] + '-' + dateArray[0];
    var conditions = [req.params.patternId, gottenDate, gottenDate, DAYS_FOR_SEARCH];
    con.query('select e.date, p.number, count(v.visitorId) as amount from eventslist e ' +
        'left join eventpattern p on p.patternId = e.patternId and e.patternId = ? ' +
        'join eventvisitors v on v.eventId = e.eventId and e.date >= ? and (datediff(e.date, ?) <= ?) ' +
        'group by e.eventId;',
        conditions, function (err, results, fields) {
            if (err) throw err;
            var events = [];
            results.forEach(function (entry) {
                events.push({date: entry.date, availability: (entry.number - entry.amount)});
            });
            console.log(events);
        });
});

router.get('/getTimeLine/:date/:patternId', function (req, res, next) {
    var dateArray = req.params.date.split('-');
    var gottenDate = dateArray[2] + "-" + dateArray[1] + '-' + dateArray[0];
    console.log(gottenDate);
    var conditions = [req.params.patternId, gottenDate];
    con.query('select e.date, e.time, p.number, count(v.visitorId) as amount from eventslist e ' +
        'left join eventpattern p on p.patternId = e.patternId and e.patternId = ? ' +
        'join eventvisitors v on v.eventId = e.eventId and e.date = ? ' +
        'group by e.eventId order by e.time;',
        conditions, function (err, results, fields) {
            console.log(results);
            if (err) throw err;
            var events = [];
            results.forEach(function (entry) {
                events.push({date: entry.date, time: entry.time, availability: (entry.number - entry.amount)});
            });
            res.json({events: events});
        });
});

router.get('/submitVisitor/:name/:email/:eventId', function (req, res, next) {
    var visitor = [req.params.name, req.params.email, req.params.name, req.params.email];
    con.query('insert into visitors (name, email) select * from (select ?, ?) as tmp ' +
        'where not exists(select * from visitors where name = ? and email = ?) limit 1;', visitor, function (err, results, fields) {
        if (err) throw err;
        var vstrId;
        if (results.insertId == 0)
            con.query('select * from visitors where name = ? and email = ?;', visitor, function (err, results, fields) {
                if (err) throw err;
                vstrId = results[0].visitorId;
            });
        else
            vstrId = results.insertId;
        con.query('select e.date, e.time, p.number, count(v.visitorId) as amount from eventslist e ' +
            'left join eventpattern p on p.patternId = e.patternId ' +
            'join eventvisitors v on v.eventId = e.eventId where e.eventId = ? group by e.eventId ;',
            [req.params.eventId], function (err, results, fields) {
                if (err) throw err;
                if (results.length == 0 || results[0].number - results[0].amount < 1) {
                    res.render('index', {success: false});
                }
                else {
                    con.query('insert into eventvisitors (eventId, visitorId) values (?, ?);', [req.params.eventId, vstrId], function (err, results, fields) {
                        if (err) throw err;
                        res.render('index', {success: true});
                    });
                }
            });
    });
});

module.exports = router;
