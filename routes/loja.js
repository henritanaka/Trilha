const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "GET / database connection at loja", error: error})}
        conn.query(
            'SELECT * FROM tbl_loja;',
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "GET / database return at loja", error: error})}
                const response = {
                    loja_quantity: result.length,
                    loja_list: result.map(loja => {
                        return{
                            id: loja.id_loja,
                            valor: loja.valor,
                            moeda: loja.moeda,
                            url: loja.url
                        }
                    })
                }
                res.status(201).send(response)
            }
        )
    })
});

router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "PATCH / database connection at loja", error: error})}
        conn.query(
            'INSERT INTO tbl_loja (valor, moeda, url) VALUES (?,?,?)',
            [
                req.body.valor, 
                req.body.moeda,
                req.body.url
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "PATCH / database return at loja", error: error})}
                const response = {
                    message: 'Loja item insert with sucess',
                    skin:{ //Note, result.id_skin return nothing
                        valor: req.body.valor,
                        moeda: req.body.moeda,
                        url: req.body.url
                    }
                } //Attention of status return
                return res.status(202).send({response})
            }
        )
    })
})

router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "PATCH / database connection at loja", error: error})}
        conn.query(
            `UPDATE tbl_loja
                SET moeda = ?,
                    valor = ?,
                    url = ?
            WHERE id_loja = ?`,
            [
                req.body.moeda, 
                req.body.valor,
                req.body.url,
                req.body.id_loja
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "PATCH / database return at loja", error: error})}
                const response = {
                    message: 'Loja item update with sucess',
                    loja:{
                        id_loja: req.body.id_loja, //Note, result.id_loja return nothing
                        valor: req.body.valor,
                        moeda: req.body.moeda,
                        url: req.body.url
                    }
                } //Attention of status return
                return res.status(202).send({response})
            }
        )
    })
})

//Delete a product
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "DELETE / database connection at loja", error: error})}
        conn.query(
            `DELETE FROM tbl_loja WHERE id_loja = ?`, [req.body.id_loja],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "DELETE / database return at loja", error: error})}
                const response = {
                    message: "Loja item remove with sucess",
                } // Attention for status
                return res.status(202).send({response})
            }
        )
    })
})

module.exports = router;

