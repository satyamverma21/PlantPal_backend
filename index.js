require('dotenv').config()
const express = require('express')
const cors = require('cors');
const multer = require('multer');
const bodyParser = require("body-parser");
const connectToMongo = require('./db')
const axios = require('axios');
const { header } = require('express-validator');
const fs = require('fs');


connectToMongo();
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public/images'));
app.use(cors())

let fname;
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/')
//     },
//     filename: (req, file, cb) => {
//         fname = file.originalname;
//         cb(null, fname);
//     }

// })
// const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage(); // Store files in memory

const upload = multer({ storage: storage });

app.post('/', upload.single('image'), async (req, res) => {

    const file = req.file;
    const url = 'https://my-api.plantnet.org/v2/identify/all?include-related-images=false&no-reject=false&lang=en&api-key=' + process.env.netKey;
   
    const blob = new Blob([file.buffer], { type: file.mimetype })
    const formData = new FormData();
    formData.append('images', blob, 'image.jpg');

    try {
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        console.log("success hit from response",response.data.bestMatch )

        res.json({data: response.data.results[0]})

        console.log("hii",response.bestMatch)
    } catch (error) {
        // console.log("plantnet error: ", error)
        console.log()
        res.json({msg: error.response.data.message})
    }

})

app.get('/', (req, res) => { res.send('welcome to plantpal backend') })

app.post('/sellPlant', (req, res) => {




    res.json({ 'msg': 'success' })
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/product', require('./routes/products'));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})