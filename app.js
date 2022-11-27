const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')

const routeUsers = require('./routes/users')
const routeSkin = require('./routes/skin')
const routesLoja = require('./routes/loja')
const routesPartida = require('./routes/partida')

app.use(morgan('dev'));
app.use('/uploads-loja', express.static('uploads-loja'))
app.use('/uploads-skin', express.static('uploads-skin'))
app.use(bodyParser.urlencoded({ extended: false})); // just simple data
app.use(bodyParser.json()); // body json input

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
})

app.use('/users', routeUsers)
app.use('/skin', routeSkin)
app.use('/loja', routesLoja)
app.use('/partida', routesPartida)

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
            message: error.message
        }
    })
})

module.exports = app;