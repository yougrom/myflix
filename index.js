const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Integrating Mongoose with a REST API
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a write stream (in append mode)
// A ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// Endpoints ==================================================================================================

// 1. GET the list of data about ALL movies
app.get('/movies', (req, res) => {
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
app.get('/movies/:Title', async (req, res) => {
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
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');   
});

// 4. GET all users
app.get('/users', async (req, res) => {
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
app.get('/users/:username', async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.username });
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
app.post('/movies', (req, res) => {
    Movies.create(req.body)
      .then(newMovie => {
        res.status(201).json(newMovie);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
});

// 7. Register New User (POST /users)
app.post('/users', async (req, res) => {
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            birthday: req.body.birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
  });
});

// 8. Add a movie to a user's list of favorites
app.post('/users/:username/movies/:_id', async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.username },
      { $push: { favoriteMovies: req.params._id } },
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

// 9. Update a user's info, by username
app.put('/users/:username', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, 
    { $set:
      {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday
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
app.delete('/users/:username/favoriteMovies/:_id', (req, res) => {
  const { username, _id } = req.params;

  // Find user by username
  Users.findOne({ username: username })
    .then(user => {
      if (!user) {
        res.status(404).send('User not found');
        return;
      }

      // Checking if the movie is in the favorites list
      if (!user.favoriteMovies.includes(_id)) {
        res.status(404).send('Movie not found in favorites');
        return;
      }

      // Update the user by removing the movie from the favorites list
      Users.updateOne(
        { _id: user._id },
        { $pull: { favoriteMovies: _id } }
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
app.delete('/users/:username', async (req, res) => {
  try {
    const user = await Users.findOneAndDelete({ username: req.params.username });

    if (!user) {
      res.status(400).send(req.params.username + ' was not found');
    } else {
      res.status(200).send(req.params.username + ' was deleted.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// 12. DELETE a movie from our list by ID
app.delete('/movies/:id', (req, res) => {
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
app.get('/movies/Genre/:Name', async (req, res) => {
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
app.get('/movies/Director/:Name', async (req, res) => {
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
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// Error-handling middleware functions
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
