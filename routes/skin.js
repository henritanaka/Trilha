const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');
const fs = require('fs')

const storage = multer.diskStorage({//callback
    destination: function (req, file, cb){
        cb(null, './uploads') //diretório na minha máquina
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
router.post('/image', upload.single('image_skin'), (req, res, next) => {
    //console.log(req.file)
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "POST /image database connection at skins", error: error})}
        conn.query(
            'INSERT INTO tbl_skin (nome, path) VALUES (?,?)', //Execution of call
            [
                req.body.nome,
                (req.file.path).replace(/\\/g, '/')
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "POST /image database return at skins", error: error})}
                const response = {
                    message: 'Image insert with sucess',
                    path: (req.file.path).replace(/\\/g, '/')
                }
                res.status(201).send(response)
            }
        )
    })
});

router.patch('/image', upload.single('image_skin'), (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "GET / database connection at skins", error: error})}
        console.log(req.file)
        if(req.file == undefined){
            console.log("Not contains image to update")
            conn.query(
                `UPDATE tbl_skin
                    SET nome = ?
                WHERE id_skin = ?`,
                [
                    req.body.nome, 
                    req.body.id_skin
                ],
                (error, result, field) => { //Result of call
                    conn.release(); //Release pull conection
                    if(error) { return res.status(500).send({ message: "PATCH / database return at skins", error: error})}
                    const response = {
                        message: 'Skin update with sucess',
                        skin:{
                            id_skin: req.body.id_skin, //Note, result.id_skin return nothing
                            nome: req.body.nome,
                            path: req.body.path
                        }
                    } //Attention of status return
                    return res.status(202).send({response})
                }
            )
        } else {
            console.log("Contains image to update")
            conn.query(
                'SELECT * FROM tbl_skin WHERE id_skin = ?', [req.body.id_skin],
                (error, result, field) => {
                    conn.release();
                    if(error) { return res.status(500).send({ message: "PATCH /image database return at skins", error: error})}
                    const path = "./" + result[0].path
                    fs.unlink(path, (err) => { return res.status(500).send()})
                    mysql.getConnection((error, conn) => {
                        if(error) { return res.status(500).send({ error: "PATCH / database connection at skins", error: error})}
                        conn.query(
                            `UPDATE tbl_skin
                                SET nome = ?,
                                    path = ?
                            WHERE id_skin = ?`,
                            [
                                req.body.nome, 
                                (req.file.path).replace(/\\/g, '/'),
                                req.body.id_skin
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

//-------------------------------------------------------------------------------------------

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "GET / database connection at skins", error: error})}
        conn.query(
            'SELECT * FROM tbl_skin;',
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "GET / database return at skins", error: error})}
                const response = {
                    skin_quantity: result.length,
                    skins_list: result.map(skin => {
                        return{
                            id: skin.id_skin,
                            nome: skin.nome,
                            path: skin.path
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
        if(error) { return res.status(500).send({ error: "PATCH / database connection at skins", error: error})}
        conn.query(
            'INSERT INTO tbl_skin (nome, path) VALUES (?,?)',
            [
                req.body.nome, 
                req.body.path
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "PATCH / database return at skins", error: error})}
                const response = {
                    message: 'Skin insert with sucess',
                    skin:{ //Note, result.id_skin return nothing
                        nome: req.body.nome,
                        path: req.body.path
                    }
                } //Attention of status return
                return res.status(202).send({response})
            }
        )
    })
})

router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "PATCH / database connection at skins", error: error})}
        conn.query(
            `UPDATE tbl_skin
                SET nome = ?,
                    path = ?
            WHERE id_skin = ?`,
            [
                req.body.nome, 
                req.body.path,
                req.body.id_skin
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "PATCH / database return at skins", error: error})}
                const response = {
                    message: 'Skin update with sucess',
                    skin:{
                        id_skin: req.body.id_skin, //Note, result.id_skin return nothing
                        nome: req.body.nome,
                        path: req.body.path
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
        if(error) { return res.status(500).send({ error: "DELETE / database connection at skins", error: error})}
        conn.query(
            `DELETE FROM tbl_skin WHERE id_skin = ?`, [req.body.id],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "DELETE / database return at skins", error: error})}
                const response = {
                    message: "Skin remove with sucess",
                } // Attention for status
                return res.status(202).send({response})
            }
        )
    })
})


module.exports = router;