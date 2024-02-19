# Movie API

This repository contains the backend for a movie API, developed using Node.js, Express, and MongoDB with Mongoose. It's designed to provide information about movies and user management functionalities.

## Features

- **Mongoose Models**: Implemented Mongoose models for `Movies` and `Users` schemas.
- **API Integration**: Integrated Mongoose models with the existing API, allowing for data manipulation and retrieval from the MongoDB database.
- **Request Methods**: Updated API request methods to handle:
  - Retrieving all movies
  - Fetching a single movie by title
  - Getting data about a genre by name/title
  - Obtaining information about a director by name
  - User registration
  - User information update (username, password, email, date of birth)
  - Adding/removing movies from user's list of favorites
  - User deregistration
- **Documentation Update**: Enhanced `documentation.html` with detailed API endpoints information, including data formats, request methods, and sample responses.
- **Testing**: Conducted endpoint testing using Postman to ensure functionality.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Set up your MongoDB database and configure the connection in the project.
4. Start the server using `npm start`.

## Usage

Once the server is running, you can use API clients like Postman to interact with the API. Refer to the `documentation.html` for detailed endpoint information.

## Contributing

Contributions to the Movie API are welcome. Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under GNU General Public License, version 3 (GPLv3).

## Acknowledgements

Thanks to all contributors and supporters of this project.

## Contact

For any inquiries, please contact ***youriy.gromov@gmail.com***
