const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: false
    },
    name: String,
    price: Number,
    contact: String,
    additional: String,
    file: String,
   
});


const market = mongoose.model("Market", schema)
module.exports = market