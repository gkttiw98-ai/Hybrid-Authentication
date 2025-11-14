# Hybrid Authentication

A hybrid authentication system built with Node.js, Express, and MongoDB that implements JWT-based authentication with access and refresh tokens.

## Features

- User signup and authentication
- JWT-based access tokens (2-minute expiry)
- Refresh tokens (7-day expiry)
- Session management with IP tracking
- Cookie-based token storage
- Protected routes with authentication middleware

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: Cookie-parser, CORS

## Installation

1. Clone the repository:
```bash
git clone https://github.com/gkttiw98-ai/Hybrid-Authentication.git
cd Hybrid-Authentication
```

2. Install dependencies:
```bash
npm install
```

3. Configure your MongoDB connection in `app.js` (update the connection string)

4. Start the server:
```bash
node app.js
```

The server will run on `http://localhost:8000`

## Project Structure

- `app.js` - Main server file with routes and authentication logic
- `signup.html` - User signup page
- `home.html` - Protected home page
- `about.html` - Protected about page

## API Endpoints

- `GET /` - Signup page
- `POST /signup` - User registration
- `GET /home.html` - Protected home page (requires authentication)
- `GET /about.html` - Protected about page (requires authentication)

## Authentication Flow

1. User signs up via `/signup` endpoint
2. Server generates access token (2m expiry) and refresh token (7d expiry)
3. Tokens are stored in HTTP-only cookies
4. Protected routes check for valid access token
5. If access token expires, refresh token is used to generate new tokens
6. Sessions are tracked with IP addresses

## License

ISC

