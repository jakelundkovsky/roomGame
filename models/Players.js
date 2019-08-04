const mongoose = require('mongoose'); // call mongoose
const Schema = mongoose.Schema; // import schema from mongoose
const bcrypt = require('bcrypt'); // call bcrypt for passwords

// This is a users information stored in the database
const playerSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    seniority: Number,
    currRoom: Room,
    inked: Boolean,
    email: String,
    password: String
});

// generates a hashed password
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Player', playerSchema);
