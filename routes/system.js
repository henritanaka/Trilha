const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');

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

router.get('/skin', (req, res, next) => {
    console.log(req.file)
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "POST / database connection at products", error: error})}
        conn.query(
            'SELECT * FROM tbl_skin;',
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "POST / database return at products", error: error})}
                const response = {
                    skin_quantity: result.length,
                    skins_list: result.map(skin => {
                        return{
                            nome: skin.nome,
                            url: ('http://localhost:3001/' + skin.path).replace(/\\/g, '/'),
                        }
                    })
                }
                res.status(201).send(response)
            }
        )
    })
});


router.post('/skin', upload.single('image_skin'), (req, res, next) => {
    console.log(req.file)
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: "POST / database connection at products", error: error})}
        conn.query(
            'INSERT INTO tbl_skin (nome, path) VALUES (?,?)', //Execution of call
            [
                req.body.nome,
                req.file.path
            ],
            (error, result, field) => { //Result of call
                conn.release(); //Release pull conection
                if(error) { return res.status(500).send({ message: "POST / database return at products", error: error})}
                const response = {
                    message: 'Image insert with sucess',
                    url: ('http://localhost:3001/' + req.file.path).replace(/\\/g, '/')
                }
                res.status(201).send(response)
            }
        )
    })
});

module.exports = router;