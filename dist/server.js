"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mysql_1 = __importDefault(require("mysql"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.text());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
const dbConnection = mysql_1.default.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '0',
    database: 'holandly'
});
/*
dbConnection.query(`select visitors.name, visitors.email, eventsList.date, eventsList.time, eventPattern.type from holandly.eventVisitors
                      inner join visitors on eventVisitors.visitorId = visitors.id
                      inner join eventsList on eventVisitors.eventId = eventsList.id
                      inner join eventPattern on eventsList.patternId = eventPattern.id;`, function(err: any, results: any, fields: any) {
  if(err) throw err;
  console.log(results);
})*/
app.get('/scheduled', function (req, res) {
    let scheduledEvents = [];
    dbConnection.query(`select visitors.name, visitors.email, eventsList.date, eventsList.time, eventPattern.type, eventPattern.number,
                      eventPattern.duration, eventPattern.description from holandly.eventVisitors
                      inner join visitors on eventVisitors.visitorId = visitors.id
                      inner join eventsList on eventVisitors.eventId = eventsList.id
                      inner join eventPattern on eventsList.patternId = eventPattern.id
                      order by eventsList.date, eventsList.time;`, function (err, results, fields) {
        if (err)
            throw err;
        results.forEach(function (entry) {
            let event = {};
            event.name = entry.name;
            event.email = entry.email;
            event.date = entry.date;
            event.time = entry.time;
            event.type = entry.type;
            event.number = entry.number;
            event.duration = entry.duration;
            event.description = entry.description;
            scheduledEvents.push(event);
        });
        res.end(JSON.stringify(scheduledEvents));
    });
});
app.get('/data', function (req, res) {
    let respObjects = [];
    dbConnection.query(`select * from eventPattern;`, function (err, results, fields) {
        if (err)
            throw err;
        results.forEach(function (entry) {
            let eventObject = {};
            eventObject.id = entry.id;
            eventObject.type = entry.type;
            eventObject.number = entry.number;
            eventObject.duration = entry.duration;
            eventObject.description = entry.description;
            respObjects.push(eventObject);
        });
        res.end(JSON.stringify(respObjects));
    });
});
app.get('/events', function (req, res) {
    let respObjects = [];
    dbConnection.query(`select * from eventsList order by date, time;`, function (err, results, fields) {
        if (err)
            throw err;
        results.forEach(function (entry) {
            let eventObject = {};
            eventObject.id = entry.id;
            eventObject.time = entry.time;
            eventObject.date = entry.date;
            respObjects.push(eventObject);
        });
        res.end(JSON.stringify(respObjects));
    });
});
app.post('/pattern', function (req, res) {
    let pattern = req.body;
    console.log(pattern);
    dbConnection.query(`INSERT INTO eventPattern SET ?`, pattern, function (err, results, fields) {
        if (err)
            throw err;
    });
});
app.post('/events', function (req, res) {
    let events = req.body;
    console.log(events);
    events.forEach(function (entry) {
        dbConnection.query(`INSERT INTO eventsList SET ?`, entry, function (err, results, fields) {
            if (err)
                throw err;
        });
    });
});
app.delete('/pattern/*', function (req, res) {
    let patternId = [];
    patternId.push(req.params[0]);
    console.log(patternId);
    dbConnection.query(`DELETE eventPattern, eventsList, eventVisitors, visitors FROM eventPattern
                      INNER JOIN eventList ON eventPattern.id = eventsList.patternId
                      inner join eventVisitors on eventsList.id = eventVisitors.eventId
                      inner join visitors on eventVisitors.visitorId = visitors.id
                      WHERE eventPattern.id=?`, patternId, function (err, results, fields) {
        if (err)
            throw err;
        console.log("destroyed");
    });
});
app.delete('/event/*', function (req, res) {
    let eventId = [];
    eventId.push(req.params[0]);
    console.log(eventId);
    dbConnection.query(`DELETE eventsList, eventVisitors, visitors FROM eventsList
                      inner join eventVisitors on eventsList.id = eventVisitors.eventId
                      inner join visitors on eventVisitors.visitorId = visitors.id
                      WHERE eventsList.id=?`, eventId, function (err, results, fields) {
        if (err)
            throw err;
        console.log("destroyed");
    });
});
app.listen(8130, () => {
    console.log('wat up');
});
//# sourceMappingURL=server.js.map