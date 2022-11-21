var mysql = require('mysql');
var pool = mysql.createPool({
    "user" : "admin2",
    "password" : "123mudar",
    "database" : "Trilha03",
    "host" : "3.87.184.20",
    "port" : "3306",
    multipleStatements: true
}) 

// var mysql = require('mysql');
// var pool = mysql.createPool({
//     "user" : process.env.MYSQL_USER,
//     "password" : process.env.MYSQL_PASSWORD,
//     "database" : process.env.MYSQL_DATABASE,
//     "host" : process.env.MYSQL_HOST,
//     "port" : process.env.MYSQL_PORT,
//     multipleStatements: true
// })      

exports.pool = pool;