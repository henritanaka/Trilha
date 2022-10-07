const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')

const routeUsers = require('./routes/users')

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({ extended: false})); // just simple data
app.use(bodyParser.json()); // body json input

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*') //All type of servers url, can access my website
    res.header('Access-Control-Allow-Header', 
                'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    ) //Type of header(cabeçalho) server will accept
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT', 'POST', 'PATCH', 'DELETE', 'GET');
        return res.status(200).send({});
    }
    next();
})

app.use('/users', routeUsers)

//When route path is not found - Note: don't expecified the path on use() param
app.use((req, res, next) => {
    const error = new Error('Request specified not found ou not exist ;-;');
    error.status = 404;
    next(error);
})

//If exists the error abouve(if you change the order of methods will doesn't work), 
//will activate the method
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        error: {
            message: "Backend not running",
            error: error.message
        }
    })
})

module.exports = app;