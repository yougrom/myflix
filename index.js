const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');
  const app = express();

// set up static file serving
app.use(express.static('public'));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

let topMarvelMovies = [
    {
        title: 'Iron Man',
        director: 'Jon Favreau',
        releaseYear: 2008,
        studio: 'Marvel Studios',
        imdbRating: 7.9
    },
    {
        title: 'The Incredible Hulk',
        director: 'Louis Leterrier',
        releaseYear: 2008,
        studio: 'Marvel Studios',
        imdbRating: 6.7
    },
    {
        title: 'Iron Man 2',
        director: 'Jon Favreau',
        releaseYear: 2010,
        studio: 'Marvel Studios',
        imdbRating: 7.0
    },
    {
        title: 'Thor',
        director: 'Kenneth Branagh',
        releaseYear: 2011,
        studio: 'Marvel Studios',
        imdbRating: 7.0
    },
    {
        title: 'Captain America: The First Avenger',
        director: 'Joe Johnston',
        releaseYear: 2011,
        studio: 'Marvel Studios',
        imdbRating: 6.9
    },
    {
        title: 'The Avengers',
        director: 'Joss Whedon',
        releaseYear: 2012,
        studio: 'Marvel Studios',
        imdbRating: 8.0
    },
    {
        title: 'Iron Man 3',
        director: 'Shane Black',
        releaseYear: 2013,
        studio: 'Marvel Studios',
        imdbRating: 7.2
    },
    {
        title: 'Thor: The Dark World',
        director: 'Alan Taylor',
        releaseYear: 2013,
        studio: 'Marvel Studios',
        imdbRating: 6.9
    },
    {
        title: 'Captain America: The Winter Soldier',
        director: 'Anthony and Joe Russo',
        releaseYear: 2014,
        studio: 'Marvel Studios',
        imdbRating: 7.7
    },
    {
        title: 'Guardians of the Galaxy',
        director: 'James Gunn',
        releaseYear: 2014,
        studio: 'Marvel Studios',
        imdbRating: 8.0
    }
];

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my movie app!');
});

app.get('/movies', (req, res) => {
    res.json(topMarvelMovies);
});

// listen for requests
app.listen(8082, () => {
    console.log('Your app is listening on port 8082.');
});

// error-handling middleware functions
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });