const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
const app = express();

const { check, validationResult } = require('express-validator');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Integrating Mongoose with a REST API
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//connects to local database. swap with .connect function below if needed.
// mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });

//connects to MongoDB Atlas database
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a write stream (in append mode)
// A ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// Setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// bodyParser middleware function
app.use(bodyParser.json()); //any time using req.body, the data will be expected to be in JSON format
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
const cors = require('cors');
app.use(cors());

// Import auth.js
let auth = require('./auth')(app);

// Import passport and passport.js 
const passport = require('passport');
require('./passport');


// Endpoints ==================================================================================================

// 1. GET the list of data about ALL movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find()
      .then(movies => {
        res.json(movies); // Возвращает данные всех фильмов из базы данных
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
});

// 2. GET a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.Title });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// 3. Default text response when at /
app.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.send('Welcome to my movie app!');   
});

// 4. GET all users
app.get('/users', /**passport.authenticate('jwt', {session: false}),*/ async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

// 5. GET a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.Username });
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// 6. POST data for a new movie to our list of movies
app.post('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.create(req.body)
      .then(newMovie => {
        res.status(201).json(newMovie);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
});

// 7.10 Register New User (POST /users) + Hashed Password
app.post('/users',
// Validation logic here for request
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {

  // check the validation object for errors
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
    .then((user) => {
      if (user) {
      //If the user is found, send a response that it already exists
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// 8. Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:_id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params._id } },
      { new: true } // This line ensures that the updated document is returned
    );

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// 9.10 PUT Update a user's info, by username
app.put('/users/:Username', 
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], passport.authenticate('jwt', {session: false}), async (req, res) => {

  // check the validation object for errors
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  await Users.findOneAndUpdate({ Username: req.params.Username }, 
    { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
        Death: req.body.Death
      }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

// 10. DELETE a Movie from User's Favorite List by ID
app.delete('/users/:Username/FavoriteMovies/:_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  const { Username, _id } = req.params;

  // Find user by Username
  Users.findOne({ Username: Username })
    .then(user => {
      if (!user) {
        res.status(404).send('User not found');
        return;
      }

      // Checking if the movie is in the favorites list
      if (!user.FavoriteMovies.includes(_id)) {
        res.status(404).send('Movie not found in favorites');
        return;
      }

      // Update the user by removing the movie from the favorites list
      Users.updateOne(
        { _id: user._id },
        { $pull: { FavoriteMovies: _id } }
      )
      .then(() => {
        res.status(200).send('Movie was removed from favorites');
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });

    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// 11. DELETE a user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const user = await Users.findOneAndDelete({ Username: req.params.Username });

    if (!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// 12. DELETE a movie from our list by ID
app.delete('/movies/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findByIdAndDelete(req.params.id)
    .then(movie => {
      if (!movie) {
        res.status(404).send('Movie not found');
      } else {
        res.status(200).send('Movie was deleted');
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// 13. GET a movie by its genre name
app.get('/movies/Genre/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    // Search for movies with the specified genre
    const movies = await Movies.find({ 'Genre.Name': req.params.Name });

    if (movies && movies.length > 0) {
      // Return the list of movies that match the genre
      res.json(movies);
    } else {
      res.status(404).send('No movies found for this genre');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// 14. GET data about a director (bio, birth year, death year) by name
app.get('/movies/Director/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    // Search for a movie with the specified director
    const movie = await Movies.findOne({ 'Director.Name': req.params.Name });

    if (movie && movie.Director) {
      // Extract and return only the director's information
      const directorInfo = {
        Name: movie.Director.Name,
        Bio: movie.Director.Bio,
        Birth: movie.Director.Birth,
        Death: movie.Director.Death 
      };
      res.json(directorInfo);
    } else {
      res.status(404).send('Director not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

// Error-handling middleware functions
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
