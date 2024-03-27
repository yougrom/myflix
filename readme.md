# Movie API

Welcome to the MyFlix API documentation. This repository contains the backend for a movie API, developed using Node.js, Express, and MongoDB with Mongoose.

The API is designed following REST principles, providing intuitive URLs, responses in JSON format, and standard HTTP status codes. It serves as the backend for a web application focused on movies, directors, and genres, and includes features for user registration and management functionalities.

It's specifically crafted to provide comprehensive information about movies and robust user management features.

[I've successfully connected my Heroku application to my MongoDB Atlas database by updating the connection URI in the "index.js" file with environment variables, pushed the changes to Heroku, and confirmed the app loads and connects to my database.](https://dry-ridge-94435-1154c64a056a.herokuapp.com)

## Key Features

- **Mongoose Models:** Implemented for Movies and Users schemas, facilitating efficient data structuring and manipulation.
- **API Integration:** Seamlessly integrates Mongoose models with the existing API for robust data interaction with the MongoDB database.
- **Request Methods:** The API supports various operations, including:
  - Movie retrieval
  - User registration and management
  - Genre and director information retrieval
  - Adding/removing movies from user's favorites
- **Documentation Update:** Detailed documentation with clear instructions, request methods, sample responses, and data formats.
- **Testing:** Extensive endpoint testing using tools like Postman to ensure optimal functionality.

## Endpoints

| Category                 | Action                               | Method | Endpoint                               | Description                                          |
| ------------------------ | ------------------------------------ | ------ | -------------------------------------- | ---------------------------------------------------- |
| **Movies**               | Get All Movies                       | GET    | `/movies`                              | Retrieves a list of all movies in the database.      |
|                          | Get Movie by Title                   | GET    | `/movies/:title`                       | Fetches detailed information about a movie by title. |
|                          | Add New Movie                        | POST   | `/movies`                              | Adds a new movie to the database.                    |
|                          | Delete Movie                         | DELETE | `/movies/:id`                          | Deletes a movie from the database.                   |
|                          | Get Movies by Genre                  | GET    | `/movies/Genre/:Name`                  | Retrieves a list of movies in a specific genre.      |
| **Users**                | Get Users                            | GET    | `/users`                               | Lists all registered users.                          |
|                          | Get User by Username                 | GET    | `/users/:Username`                     | Provides data about a user by username.              |
|                          | Register New User                    | POST   | `/users`                               | Registers a new user.                                |
|                          | Add Movie to User's Favorites        | POST   | `/users/:Username/movies/:MovieID`     | Adds a movie to a user's list of favorites.          |
|                          | Update User Information              | PUT    | `/users/:Username`                     | Updates user information.                            |
|                          | Delete a Movie from User's Favorites | DELETE | `/users/:username/FavoriteMovies/:_id` | Removes a movie from a user's favorites.             |
|                          | Delete User by Username              | DELETE | `/users/:Username`                     | Deletes a user from the database.                    |
| **Directors and Genres** | Get Data About a Director by Name    | GET    | `/movies/Director/:Name`               | Retrieves detailed information about a director.     |

## Contact

For any inquiries, please contact ***youriy.gromov@gmail.com***
