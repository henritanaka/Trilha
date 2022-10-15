const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt')

router.get('/', (req, res, next) => {
    return res.status(200).send({message: "Hello World"})
});

router.post('/cadastro', (req, res, next) => {
    mysql.getConnection((err, conn) => {
        if(err) {return res.status(500).send({ message: "POST /cadastro database connection at users", error: err})}
        conn.query('SELECT * FROM tbl_usuario WHERE email = ?', 
        [req.body.email], (error, results) => {
            if (error) { return res.status(500).send({ message:"POST /cadastro email validation at users", error: error})}
            if (results.length > 0){
                res.status(409).send({ message: "Useário já cadastrado"})
            }else{
                bcrypt.hash(req.body.senha, 0, (errBcrypt, hash) => {
                    if(errBcrypt) { return res.status(500).send( {message: "Hash creation", error: errBcrypt})}
                    conn.query(
                    `INSERT INTO tbl_usuario (email,senha,nome,data_cadastro,data_nascimento,sexo,moeda,ponto,skin,flag_adm) VALUES (?,?,?,?,?,?,?,?,?,?)`, 
                    [req.body.email, hash, req.body.nome, req.body.data_cadastro, req.body.data_nascimento, req.body.sexo, req.body.moeda, req.body.ponto, req.body.skin, req.body.flag_adm],
                    (error, results) => {
                        conn.release();
                        if(error){ return res.status(500).send({ error: error})}
                        response = {
                            message: 'Users create with sucess',
                            userCreate: {
                                id_user: results.insertId,
                                email: req.body.email
                            }
                        }
                        return res.status(201).send(response)
                    })
                })
            }
        })
    })
})

router.post('/login', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({message: "POST /login connection users", error: error}) }
        const query = `SELECT * FROM tbl_usuario WHERE email = ?`
        conn.query(query, [req.body.email], (error, results, fields) => {
            conn.release()
            if(error){return res.status(500).send({message: "POST /login connection database users", error: error})}
            if(results.length < 1 ){
                return res.status(401).send({message: "Not Authorized ;-;"})
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if (err){
                    return res.status(401).send({ message: "Fail in authentication - Error"})
                }
                if (result){
                    return res.status(200).send({ message: "Sucess Authentication"})
                }
                return res.status(401).send({ message: "Fail in authentication"})
            })
        })
    })
})

module.exports = router;