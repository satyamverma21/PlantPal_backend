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

const production = false

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

        if (production) {

            const response = await axios.post(url, {
                images: [Buffer.from(file.buffer).toString('base64')],
            }, {
                headers: {
                    'Api-Key': `${process.env.idKey}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    details: 'common_names,url,description,image,synonyms,edible_parts,watering'
                }
            })

            if (response.data.result.is_plant.binary)
                res.json({ data: response.data.result.classification.suggestions })
            else
                res.json({ msg: "Could not detect plant." })

        } else {

            try {
                const response = fs.readFileSync('plantId.json', 'utf8');
                const data = JSON.parse(response);

                if (data.result.is_plant.binary)
                    res.json({ data: data.result.classification.suggestions })
                else
                    res.json({ msg: "Could not detect plant." })

            } catch (error) {
                console.error('Error reading file:', error);
            }

            // try {
            //     await fs.writeFile('response.json', response.data.result);
            //     console.log(`API response written to file`);
            // } catch (error) {
            //     console.error('Error writing file:', error);
            // }

            // console.log("debug: /idPlant responded ", response)
            // res.json({ data: response.data.result.classification.suggestions })
        }

    } catch (error) {
        res.json({ msg: error.message })
        console.log("debug: /idPlant error", error.message)
    }
})

app.post('/idDicease', upload.single('image'), async (req, res) => {

    console.log("debug: /idDicease ")

    const file = req.file;
    const url = 'https://plant.id/api/v3/health_assessment';

    try {
        if (production) {
            const response = await axios.post(url, {
                images: [Buffer.from(file.buffer).toString('base64')],
            }, {
                headers: {
                    'Api-Key': `${process.env.idKey}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    details: 'local_name,description,url,treatment,classification,common_names,cause'
                }
            })

            if (response.data.result.is_plant.binary)
                res.json({ data: response.data.result })
            else
                res.json({ msg: "Could not detect plant." })
        }
        else {

            try {
                const response = fs.readFileSync('diceaseId.json', 'utf8');
                const data = JSON.parse(response);
                if (data.result.is_plant.binary)
                    res.json({ data: data.result })
                else
                    res.json({ msg: "Could not detect plant." })

            } catch (error) {
                console.error('Error reading file:', error);
            }

            // const jsonData = JSON.stringify(response.data, null, 2); // Format JSON with indentation

            // fs.writeFile('response_capture.json', jsonData, (err) => {
            //     if (err) {
            //         console.error('Error writing to file:', err);
            //     } else {
            //         console.log('Response successfully dumped to response.json');
            //     }
            // })


            // console.log("debug: /idDicease responded ", response)
            // res.json({ data: response.data.result.classification.suggestions })

        }

    } catch (error) {
        res.json({ msg: error.message })
        console.log("debug: /idDicease error", error.message)
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