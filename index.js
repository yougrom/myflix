const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

  const app = express();

// set up static file serving
app.use(express.static('public'));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

let movies = [
    {   
        id: 1,
        title: 'Iron Man',
        director: 'Jon Favreau',
        releaseYear: 2008,
        studio: 'Marvel Studios',
        imdbRating: 7.9
    },
    {   
        id: 2,
        title: 'The Incredible Hulk',
        director: 'Louis Leterrier',
        releaseYear: 2008,
        studio: 'Marvel Studios',
        imdbRating: 6.7
    },
    {   
        id: 3,
        title: 'Iron Man 2',
        director: 'Jon Favreau',
        releaseYear: 2010,
        studio: 'Marvel Studios',
        imdbRating: 7.0
    },
    {   
        id: 4,
        title: 'Thor',
        director: 'Kenneth Branagh',
        releaseYear: 2011,
        studio: 'Marvel Studios',
        imdbRating: 7.0
    },
    {   
        id: 5,
        title: 'Captain America: The First Avenger',
        director: 'Joe Johnston',
        releaseYear: 2011,
        studio: 'Marvel Studios',
        imdbRating: 6.9
    },
    {   
        id: 6,
        title: 'The Avengers',
        director: 'Joss Whedon',
        releaseYear: 2012,
        studio: 'Marvel Studios',
        imdbRating: 8.0
    },
    {
        id: 7,
        title: 'Iron Man 3',
        director: 'Shane Black',
        releaseYear: 2013,
        studio: 'Marvel Studios',
        imdbRating: 7.2
    },
    {
        id: 8,
        title: 'Thor: The Dark World',
        director: 'Alan Taylor',
        releaseYear: 2013,
        studio: 'Marvel Studios',
        imdbRating: 6.9
    },
    {   
        id: 9,
        title: 'Captain America: The Winter Soldier',
        director: 'Anthony and Joe Russo',
        releaseYear: 2014,
        studio: 'Marvel Studios',
        imdbRating: 7.7
    },
    {
        id: 10,
        title: 'Guardians of the Galaxy',
        director: 'James Gunn',
        releaseYear: 2014,
        studio: 'Marvel Studios',
        imdbRating: 8.0
    }
];

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

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

// error-handling middleware functions
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});