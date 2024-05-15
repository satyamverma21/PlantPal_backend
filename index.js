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

    console.log("debug: / ")

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
        res.json({ data: response.data.results[0] })
        console.log("debug: / responsed")


    } catch (error) {
        res.json({ msg: error.response.data.message })
        console.log("debug: / error")

    }

})

app.post('/idPlant', upload.single('image'), async (req, res) => {

    console.log("debug: /idPlant ")

    const file = req.file;
    const url = 'https://plant.id/api/v3/identification';

    try {
        // const response = await axios.post(url, {
        //     images: [Buffer.from(file.buffer).toString('base64')],
        // }, {
        //     headers: {
        //         'Api-Key': `${process.env.idKey}`,
        //         'Content-Type': 'application/json',
        //     },
        //     params: {
        //         details: 'common_names,url,description,image,synonyms,edible_parts,watering'
        //     }
        // })

        try {
            const data = fs.readFileSync('plantId.json', 'utf8');
            const response = JSON.parse(data);
            res.json({ data: response.result.classification.suggestions })

        } catch (error) {
            console.error('Error reading file:', error);
        }


        console.log("debug: /idPlant responded ")

    } catch (error) {
        res.json({ msg: error.message })
        console.log("debug: /idPlant error", error.message)
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