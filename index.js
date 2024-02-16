const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // Import built-in node modules fs and path
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Set up static file serving
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Create a write stream (in append mode) for logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

// Setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// Endpoint Gets the list of data about ALL movies
app.get('/movies', (req, res) => {
    res.json(movies);
  });

// Endpoint to get data about a single movie, by title
app.get('/movies/:title', (req, res) => {
    const movie = movies.find(movie => movie.title === req.params.title);
    if(movie) {
        res.json(movie);
    } else {
        res.status(404).send('Movie not found');
    }
});

// Endpoint to add data for a new movie to our list of movies
app.post('/movies', (req, res) => {
    let newMovie = req.body;

    if (!newMovie.title) {
      const message = 'Missing title in request body';
      res.status(400).send(message);
    } else {
      newMovie.id = uuid.v4();
      movies.push(newMovie);
      res.status(201).send(newMovie);
    }
});

// Endpoint to delete a movie from our list by ID
app.delete('/movies/:id', (req, res) => {
    const movieIndex = movies.findIndex(movie => movie.id == req.params.id); // == for type coercion
    if (movieIndex > -1) {
        movies.splice(movieIndex, 1);
        res.status(200).send('Movie was deleted.');
    } else {
        res.status(404).send('Movie not found');
    }
});

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

// Add a user
app.post('/users', async (req, res) => {
  try {
    let user = await Users.findOne({ Username: req.body.Username });
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      let newUser = await Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// Update a user's info, by username
app.put('/users/:Username', async (req, res) => {
  try {
    let updatedUser = await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    }, { new: true }); // This line makes sure that the updated document is returned
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// Listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// Error-handling middleware functions
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 1. Get All Movies
app.get('/movies', (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// 2. Get a Single Movie by Title
  app.get('/movies/:title', (req, res) => {
    Movies.findOne({ title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  

  // 
  app.get('/movies/genres/:name', (req, res) => {
  Movies.find({ 'genre.name': req.params.name })
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});
