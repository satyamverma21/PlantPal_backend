require('dotenv').config()
const express = require('express')
const cors = require('cors');
const multer = require('multer');
const bodyParser = require("body-parser");
const connectToMongo = require('./db')
const axios = require('axios');
const { header } = require('express-validator');

connectToMongo();
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public/images'));
app.use(cors())

const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'uploads/')
    },
    filename:(req, file, cb)=>{
        cb(null, file.fieldname)
    }

})
// const upload = multer({ dest: 'uploads/' });

const upload = multer({ storage: storage });

app.post('/', upload.single('image'), async (req, res) => {
    const formData = req.body;

    console.log('FormData:', formData);

    // Access uploaded file
    const file = req.file;
    console.log('Uploaded file:', file);
    const url = 'https://my-api.plantnet.org/v2/identify/all?include-related-images=false&no-reject=false&lang=en&api-key=2b10ZgUYxHlnjN6oqIqr9Hyie'
    // const response = await axios.post(url,
    //     {
    //         images: file
    //     }
    //     , {
    //         headers: {
    //             // 'accept': 'application/json',
    //             // 'Content-Type': 'multipart/form-data',
    //             // 'Authorization': 'Bearer 2b10ZgUYxHlnjN6oqIqr9Hyie'
    //         },
    //     })

    // console.log(Object.keys(response));

    res.json({ msg: "success hit" });
})

app.get('/',(req,res)=>{res.send('welcome to plantpal backend')})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/product', require('./routes/products'));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})