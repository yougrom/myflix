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

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// Endpoints ==================================================================================================

// 1. Gets the list of data about ALL movies
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

// 2. To get data about a single movie, by title
app.get('/movies/:title', (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then(movie => {
        if (movie) {
          res.json(movie);
        } else {
          res.status(404).send('Movie not found');
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
});

// 3. Default text response when at /
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');   
});

// 4. Get all users
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

// 5. Get a user by username
app.get('/users/:Username', async (req, res) => {
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

// 6. Add data for a new movie to our list of movies
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
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
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
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
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
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, 
    { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
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

// 10. Delete a movie from our list by ID
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

// 11. Delete a user by username
app.delete('/users/:Username', async (req, res) => {
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


// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// error-handling middleware functions
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
