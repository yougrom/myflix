// myflix/index.js

/**
 * @file index.js - myFlix API
 * @module myFlix
 * @description This file contains the RESTful API for the myFlix application.
 */
const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");
const app = express();

const { check, validationResult } = require("express-validator");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Integrating Mongoose with a REST API
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

// connects to local database. swap with .connect function below if needed.
// mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// connects to MongoDB Atlas database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a write stream (in append mode)
// A ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

// Setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

// bodyParser middleware function
app.use(bodyParser.json()); //any time using req.body, the data will be expected to be in JSON format
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
const cors = require("cors");
app.use(cors());
// let allowedOrigins = [
//   'http://localhost:8080',
//   'http://testsite.com',
//   'http://localhost:1234',
//   'https://myflix-gromov.netlify.app'
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
//       let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
//       return callback(new Error(message), false);
//     }
//     return callback(null, true);
//   }
// }));

// Import auth.js
let auth = require("./auth")(app);

// Import passport and passport.js
const passport = require("passport");
require("./passport");

// Endpoints ==================================================================================================

/**
 * @api {get} /movies Get all movies
 * @apiName GetMovies
 * @apiGroup Movies
 * @apiSuccess {Object[]} movies List of all movies.
 * @apiError (500) InternalServerError An error occurred while fetching the movies.
 */
app.get(
  "/movies",
  /*passport.authenticate('jwt', {session: false}),*/ (req, res) => {
    Movies.find()
      .then((movies) => {
        res.json(movies); // Returns data for all movies in the database
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * @api {get} /movies/:Title Get movie by title
 * @apiName GetMovieByTitle
 * @apiGroup Movies
 * @apiParam {String} Title Movie title.
 * @apiSuccess {Object} movie Movie details.
 * @apiError (404) NotFound The movie was not found.
 * @apiError (500) InternalServerError An error occurred while fetching the movie.
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ Title: req.params.Title });
      if (movie) {
        res.json(movie);
      } else {
        res.status(404).send("Movie not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

/**
 * @api {get} / Get welcome message
 * @apiName GetWelcomeMessage
 * @apiGroup General
 * @apiSuccess {String} message Welcome message.
 */
app.get("/", (req, res) => {
  res.send("Welcome to my movie app!");
});

/**
 * @api {get} /users Get all users
 * @apiName GetUsers
 * @apiGroup Users
 * @apiSuccess {Object[]} users List of all users.
 * @apiError (500) InternalServerError An error occurred while fetching the users.
 */
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * @api {get} /users/:Username Get user by username
 * @apiName GetUserByUsername
 * @apiGroup Users
 * @apiParam {String} Username User's username.
 * @apiSuccess {Object} user User details.
 * @apiError (404) NotFound The user was not found.
 * @apiError (500) InternalServerError An error occurred while fetching the user.
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOne({ Username: req.params.Username });
      if (user) {
        res.json(user);
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

/**
 * @api {post} /movies Add a new movie
 * @apiName AddMovie
 * @apiGroup Movies
 * @apiParam {Object} movie Movie details.
 * @apiSuccess {Object} newMovie Details of the added movie.
 * @apiError (500) InternalServerError An error occurred while adding the movie.
 */
app.post(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.create(req.body)
      .then((newMovie) => {
        res.status(201).json(newMovie);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * @api {post} /users Register a new user
 * @apiName RegisterUser
 * @apiGroup Users
 * @apiParam {String} Username User's username.
 * @apiParam {String} Password User's password.
 * @apiParam {String} Email User's email.
 * @apiParam {Date} Birthday User's birthday.
 * @apiSuccess {Object} user Details of the registered user.
 * @apiError (400) BadRequest The username already exists.
 * @apiError (422) UnprocessableEntity Validation error.
 * @apiError (500) InternalServerError An error occurred while registering the user.
 */
app.post(
  "/users",
  // Validation logic here for request
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
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
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * @api {post} /users/:Username/movies/:_id Add a movie to user's favorites
 * @apiName AddFavoriteMovie
 * @apiGroup Users
 * @apiParam {String} Username User's username.
 * @apiParam {String} _id Movie ID.
 * @apiSuccess {Object} user Updated user details.
 * @apiError (404) NotFound The user was not found.
 * @apiError (500) InternalServerError An error occurred while adding the movie to favorites.
 */
app.post(
  "/users/:Username/movies/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $push: { FavoriteMovies: req.params._id } },
        { new: true } // This line ensures that the updated document is returned
      );

      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).send("User not found");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @api {put} /users/:Username Update user information
 * @apiName UpdateUser
 * @apiGroup Users
 * @apiParam {String} Username User's username.
 * @apiParam {String} Password User's password.
 * @apiParam {String} Email User's email.
 * @apiParam {Date} Birthday User's birthday.
 * @apiSuccess {Object} updatedUser Updated user details.
 * @apiError (422) UnprocessableEntity Validation error.
 * @apiError (500) InternalServerError An error occurred while updating the user information.
 */
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
          Death: req.body.Death,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @api {delete} /users/:Username/FavoriteMovies/:_id Remove a movie from user's favorites
 * @apiName RemoveFavoriteMovie
 * @apiGroup Users
 * @apiParam {String} Username User's username.
 * @apiParam {String} _id Movie ID.
 * @apiSuccess {String} message Confirmation message.
 * @apiError (404) NotFound The user or movie was not found.
 * @apiError (500) InternalServerError An error occurred while removing the movie from favorites.
 */
app.delete(
  "/users/:Username/FavoriteMovies/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { Username, _id } = req.params;

    // Find user by Username
    Users.findOne({ Username: Username })
      .then((user) => {
        if (!user) {
          res.status(404).send("User not found");
          return;
        }

        // Checking if the movie is in the favorites list
        if (!user.FavoriteMovies.includes(_id)) {
          res.status(404).send("Movie not found in favorites");
          return;
        }

        // Update the user by removing the movie from the favorites list
        Users.updateOne({ _id: user._id }, { $pull: { FavoriteMovies: _id } })
          .then(() => {
            res.status(200).send("Movie was removed from favorites");
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * @api {delete} /users/:Username Delete user
 * @apiName DeleteUser
 * @apiGroup Users
 * @apiParam {String} Username User's username.
 * @apiSuccess {String} message Confirmation message.
 * @apiError (400) BadRequest The user was not found.
 * @apiError (500) InternalServerError An error occurred while deleting the user.
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOneAndDelete({
        Username: req.params.Username,
      });

      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @api {delete} /movies/:id Delete a movie
 * @apiName DeleteMovie
 * @apiGroup Movies
 * @apiParam {String} id Movie ID.
 * @apiSuccess {String} message Confirmation message.
 * @apiError (404) NotFound The movie was not found.
 * @apiError (500) InternalServerError An error occurred while deleting the movie.
 */
app.delete(
  "/movies/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findByIdAndDelete(req.params.id)
      .then((movie) => {
        if (!movie) {
          res.status(404).send("Movie not found");
        } else {
          res.status(200).send("Movie was deleted");
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * @api {get} /movies/Genre/:Name Get movies by genre
 * @apiName GetMoviesByGenre
 * @apiGroup Movies
 * @apiParam {String} Name Genre name.
 * @apiSuccess {Object[]} movies List of movies.
 * @apiError (404) NotFound No movies found for this genre.
 * @apiError (500) InternalServerError An error occurred while fetching the movies.
 */
app.get(
  "/movies/Genre/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Search for movies with the specified genre
      const movies = await Movies.find({ "Genre.Name": req.params.Name });

      if (movies && movies.length > 0) {
        // Return the list of movies that match the genre
        res.json(movies);
      } else {
        res.status(404).send("No movies found for this genre");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

/**
 * @api {get} /movies/Director/:Name Get director by name
 * @apiName GetDirectorByName
 * @apiGroup Movies
 * @apiParam {String} Name Director's name.
 * @apiSuccess {Object} director Director details.
 * @apiError (404) NotFound The director was not found.
 * @apiError (500) InternalServerError An error occurred while fetching the director.
 */
app.get(
  "/movies/Director/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Search for a movie with the specified director
      const movie = await Movies.findOne({ "Director.Name": req.params.Name });

      if (movie && movie.Director) {
        // Extract and return only the director's information
        const directorInfo = {
          Name: movie.Director.Name,
          Bio: movie.Director.Bio,
          Birth: movie.Director.Birth,
          Death: movie.Director.Death,
        };
        res.json(directorInfo);
      } else {
        res.status(404).send("Director not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});

// Error-handling middleware funcls
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
