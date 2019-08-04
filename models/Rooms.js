const mongoose = require('mongoose'); // call mongoose
const Schema = mongoose.Schema; // import schema from mongoose

// This is a rooms information stored in the database
const roomSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    occupants: [String],
    capacity: Number,
    name: String
});

module.exports = mongoose.model('Room', roomSchema);