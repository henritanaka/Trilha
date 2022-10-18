const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

const multer = require('multer');
const fs = require('fs')

const storage = multer.diskStorage({//callback
    destination: function (req, file, cb){
        cb(null, './uploads-loja') //diretório na minha máquina
    },
    filename: function (req, file, cb){
        let data = new Date().toISOString().replace(/:/g, '-') + '-';
        cb(null, data + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else{
        cb(null, false)
    }
}

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter

}) //diretório acima 

//Upload de imagens localmente
router.post('/image', upload.single('image'), (req, res, next) => {
    //console.log(req.file)
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "POST /image database connection at loja", error: error})}
        conn.query(
            `
            INSERT INTO tbl_images (path) VALUES (?);
            INSERT INTO tbl_loja (valor, moeda, path)
            SELECT
                ?, ?, id_image
            FROM tbl_images WHERE path = ?;
            `, //Execution of call
            [
                (req.file.path).replace(/\\/g, '/'),
                req.body.valor, 
                req.body.moeda,
                (req.file.path).replace(/\\/g, '/')
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "POST /image database return at loja", error: error})}
                const response = {
                    message: 'Loja item insert with sucess',
                    skin:{ //Note, result.id_loja return nothing
                        valor: req.body.valor,
                        moeda: req.body.moeda,
                        path: (req.file.path).replace(/\\/g, '/')
                    }
                }
                res.status(201).send(response)
            }
        )
    })
});

router.patch('/image', upload.single('imagem'), (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "GET / database connection at loja", error: error})}
        console.log(req.file)
        if(req.file == undefined){
            console.log("Not contains image to update")
            conn.query(
                `UPDATE tbl_loja
                 SET moeda = ?,
                     valor = ?
                 WHERE id_loja = ?`,
                [
                    req.body.moeda, 
                    req.body.valor,
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
                            moeda: req.body.moeda
                        }
                    } //Attention of status return
                    return res.status(202).send({response})
                }
            )
        } else {
            console.log("Contains image to update")
            conn.query(
                `SELECT tbl_loja.id_loja,tbl_loja.moeda, tbl_loja.valor, tbl_images.path
                 FROM tbl_loja
                 INNER JOIN tbl_images ON tbl_images.id_image = tbl_loja.path
                 WHERE id_loja = ?`, [req.body.id_loja],
                (error, result, field) => {
                    conn.release();
                    if(error) { return res.status(500).send({ message: "PATCH /image database return at loja", error: error})}
                    const path = "./" + result[0].path
                    fs.unlink(path, (err) => { return res.status(500).send()})
                    mysql.getConnection((error, conn) => {
                        if(error) { return res.status(500).send({ error: "PATCH / database connection at loja", error: error})}
                        conn.query(
                            `UPDATE tbl_loja t1
                             INNER JOIN
                             tbl_images t2 ON t1.path = t2.id_image
                             SET t1.moeda = ?,
                                 t1.valor = ?,
                                 t2.path = ?
                             WHERE t1.id_loja = ?;`,
                            [
                                req.body.moeda,
                                req.body.valor, 
                                (req.file.path).replace(/\\/g, '/'),
                                req.body.id_loja
                            ],
                            (error, result, field) => { //Result of call
                                conn.release(); //Release pull conection
                            }
                        )
                    })
                    res.status(201).send({ message: "Update sucess/File delete with sucess", pathFileDelete: path})
                }
            )
        }
    })
});


//-----------------------------------------

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "GET / database connection at loja", error: error})}
        conn.query(
            `SELECT tbl_loja.id_loja,tbl_loja.moeda, tbl_loja.valor, tbl_images.path
            FROM tbl_loja
            INNER JOIN tbl_images ON tbl_images.id_image = tbl_loja.path`,
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
                            path: loja.path
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
        if(error) { return res.status(500).send({ error: "POST / database connection at loja", error: error})}
        conn.query(
            'INSERT INTO tbl_loja (valor, moeda, url) VALUES (?,?,?)',
            [
                req.body.valor, 
                req.body.moeda,
                req.body.url
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "POST / database return at loja", error: error})}
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
            `DELETE tbl_loja, tbl_images 
             FROM tbl_loja INNER JOIN tbl_images ON tbl_images.id_image = tbl_loja.path
             where tbl_loja.id_loja = ?`, [req.body.id],
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

router.get('/image-table', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "GET /image-table database connection at loja", error: error})}
        conn.query(
            `SELECT * FROM tbl_images;`,
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "GET /image-table database return at loja", error: error})}
                const response = {
                    image_quantity: result.length,
                    image_list: result.map(image => {
                        return{
                            id: image.id_image,
                            path: image.path
                        }
                    })
                }
                res.status(201).send(response)
            }
        )
    })
});

module.exports = router;

