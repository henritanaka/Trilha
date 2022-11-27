const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/hello', (req, res, next) => {
    return res.status(200).send({message: "Hello World"})
});

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "GET / database connection at partida", error: error})}
        conn.query(
            `SELECT * FROM tbl_partida;`,
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "GET / database return at partida", error: error})}
                const response = {
                    partida_quantity: result.length,
                    partida_list: result.map(partida => {
                        return{
                            id_partida: partida.id_partida,
                            nome_usuario: partida.nome_usuario,
                            aposta: partida.aposta,
                            flag: partida.flag
                        }
                    })
                }
                res.status(201).send(response)
            }
        )
    })
});

router.post('/', (req, res, next) => {
    //console.log(req.file)
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "POST / database connection at partida", error: error})}
        conn.query(
            'INSERT INTO tbl_partida (nome_usuario, aposta, flag) VALUES (?,?,?)', //Execution of call
            [
                req.body.nome_usuario,
                req.body.aposta,
                req.body.flag
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "POST / database return at partida", error: error})}
                const response = {
                    message: 'Partida insert with sucess'
                }
                res.status(201).send(response)
            }
        )
    })
});

router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "PATCH / database connection at loja", error: error})}
        conn.query(
            `UPDATE tbl_partida
                SET nome_usuario = ?,
                    aposta = ?,
                    flag = ?
            WHERE id_partida = ?`,
            [
                req.body.nome_usuario, 
                req.body.aposta,
                req.body.flag,
                req.body.id_partida
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "PATCH / database return at loja", error: error})}
                const response = {
                    message: 'Partida item update with sucess',
                    loja:{
                        id_loja: req.body.id_partida, //Note, result.id_loja return nothing
                        valor: req.body.nome_usuario,
                        moeda: req.body.aposta,
                        url: req.body.flag
                    }
                } //Attention of status return
                return res.status(202).send({response})
            }
        )
    })
})

router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "DELETE / database connection at partida", error: error})}
        conn.query(
            `DELETE FROM tbl_partida WHERE id_partida = ?`, [req.body.id_partida],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "DELETE / database return at partida", error: error})}
                const response = {
                    message: "Partida remove with sucess",
                } // Attention for status
                return res.status(202).send({response})
            }
        )
    })
})


module.exports = router;