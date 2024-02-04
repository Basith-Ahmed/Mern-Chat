# MernChat.md

## Introduction

MernChat is a cutting-edge messaging platform built with the MERN stack (MongoDB, Express, React, Node.js) that enables real-time communication through text and images. This document guides you through setting up, using, and contributing to MernChat.

## Features

* Sign up and log in
* Real-time messaging (text and images)
* Online/offline user status
* Secure authentication with JWT
* Sleek and responsive design with Tailwind CSS

## Getting Started

#### Prerequisites

* Node.js
* MongoDB
* npm or yarn

#### Installation

1. Clone the repository:
   ```git clone https://github.com/yourusername/MernChat.git```
3. Install server packages:
   ```cd MernChat && npm install```
5. Install client packages: ```cd client && npm install```
6. Create a `.env` file in the root directory with:
    * MongoDB URI
    * JWT secret
    * Any other required environment variables
7. Start the server: ```npm start```
8. In a new terminal, navigate to the client directory and start the React app: ```cd client && npm start```

MernChat should now be running at http://localhost:3000.


## Usage

Upon launching MernChat, users can register for an account or log in if they already have one. Once authenticated, users can:
- Send and receive text messages in real-time.
- Exchange image messages.
- See the online/offline status of users.
- Log out securely with the logout button.

## Built With

- [React](https://reactjs.org/) - The front-end framework used.
- [Node.js](https://nodejs.org/) - Server environment.
- [Express](https://expressjs.com/) - The server framework.
- [MongoDB](https://www.mongodb.com/) - For the database.
- [JWT](https://jwt.io/) - For secure user authentication.
- [Tailwind CSS](https://tailwindcss.com/) - For styling.


## Contributing

Please read [CONTRIBUTING.md](#) for details on our code of conduct and the process for submitting pull requests.


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/yourusername/MernChat/tags).


## Authors

* Basith AHmed - MernChat (Basith-Ahmed)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.


## Acknowledgments


