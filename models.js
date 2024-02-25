const mongoose = require('mongoose');

// Define the Movie Schema
let movieSchema = mongoose.Schema ({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: { type: String, required: true },
        Description: { type: String, required: true }
    },
    Director: {
        Name: { type: String, required: true },
        Bio: { type: String, required: true },
        Birth: { type: Date, required: true },
        Death: { type: Date, required: true }
    },
    ImagePath: { type: String },
    Featured: { type: Boolean }
});

// Define the User Schema
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    Death: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

// Function which hashing of submitted passwords
userSchema.statics.hashPassword = (password) => {
return bcrypt.hashSync(password, 10);
};

// Function is what compares submitted hashed passwords with the hashed passwords stored in your database
userSchema.methods.validatePassword = function(password) {
return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
const bcrypt = require('bcrypt'); // Hashing