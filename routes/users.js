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
                res.status(409).send({ message: "Usuário já cadastrado"})
            }else{
                bcrypt.hash(req.body.senha, 0, (errBcrypt, hash) => {
                    if(errBcrypt) { return res.status(500).send( {message: "Hash creation", error: errBcrypt})}
                    conn.query(
                    `INSERT INTO tbl_usuario (email, nome, senha, admin, skin, nick_name) VALUES (?,?,?,?,?,?)`, 
                    [req.body.email, req.body.nome, hash, req.body.admin, req.body.skin,  req.body.nick_name],
                    (error, results) => {
                        conn.release();
                        if(error){ return res.status(500).send({ error: error})}
                        response = {
                            message: 'Users create with sucess',
                            userCreate: {
                                id_user: results.id_usuario,
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
            console.log(results)
            if(error){return res.status(500).send({message: "POST /login connection database users", error: error})}
            if(results.length < 1 ){
                return res.status(401).send({message: "Not Authorized ;-;"})
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if (err){
                    return res.status(401).send({ message: "Fail in authentication - Error"})
                }
                if (result){
                    const info = {
                        message: "Sucess Authentication",
                        id: results[0].id_usuario,
                        email: results[0].email,
                        nome: results[0].nome,
                        moedas: results[0].moedas,
                        pontos: results[0].pontos,
                        admin: results[0].admin,
                        skin: results[0].skin,
                        nick_name: results[0].nick_name
                    }
                    return res.status(200).send({info})
                }
                return res.status(401).send({ message: "Fail in authentication"})
            })
        })
    })
})

router.patch('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "PATCH / database connection at usuario", error: error})}
        if(req.body.senha != null){
            bcrypt.hash(req.body.senha, 0, (errBcrypt, hash) => {
                if(errBcrypt) { return res.status(500).send( {message: "Hash creation", error: errBcrypt})}
                conn.query(
                    `UPDATE tbl_usuario
                        SET email = ?,
                            nome = ?,
                            senha = ?,
                            moedas = ?,
                            pontos = ?,
                            admin = ?,
                            skin = ?,
                            nick_name = ?
                    WHERE id_usuario = ?`,
                    [
                        req.body.email, 
                        req.body.nome,
                        hash,
                        req.body.moedas,
                        req.body.pontos,
                        req.body.admin,
                        req.body.skin,
                        req.body.nick_name,
                        req.body.id
                    ],
                    (error, result, field) => { //Result of call
                        conn.release(); //Release pull conection
                        if(error) { return res.status(500).send({ message: "PATCH / database return at usuario", error: error})}
                        const response = {
                            message: 'Usuario update with sucess',
                            skin:{
                                id: req.body.id,
                                email: req.body.email, 
                                nome: req.body.nome,
                                senha: req.body.senha,
                                moedas: req.body.moedas,
                                pontos: req.body.pontos,
                                admin: req.body.admin,
                                skin: req.body.skin,
                                nick_name: req.body.nick_name
                            }
                        } //Attention of status return
                        return res.status(202).send({response})
                    }
                )
            })
        } else{
            conn.query(
                `UPDATE tbl_usuario
                    SET email = ?,
                        nome = ?,
                        moedas = ?,
                        pontos = ?,
                        admin = ?,
                        skin = ?,
                        nick_name = ?
                WHERE id_usuario = ?`,
                [
                    req.body.email, 
                    req.body.nome,
                    req.body.moedas,
                    req.body.pontos,
                    req.body.admin,
                    req.body.skin,
                    req.body.nick_name,
                    req.body.id
                ],
                (error, result, field) => { //Result of call
                    conn.release(); //Release pull conection
                    if(error) { return res.status(500).send({ message: "PATCH / database return at usuario", error: error})}
                    const response = {
                        message: 'Usuario update with sucess',
                        skin:{
                            id: req.body.id,
                            email: req.body.email, 
                            nome: req.body.nome,
                            senha: req.body.senha,
                            moedas: req.body.moeda,
                            pontos: req.body.pontos,
                            admin: req.body.admin,
                            skin: req.body.skin,
                            nick_name: req.body.nick_name
                        }
                    } //Attention of status return
                    return res.status(202).send({response})
                }
            )
        }
    })
})

module.exports = router;