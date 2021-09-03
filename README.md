# Journey Together - Server API

This is the back-end API for the social media app Journey Together. Journey Together is a social media platform designed for cooperatively pursuing personal development goals.
It builds on the idea of accountability buddies; you pledge your goal in public and you can choose to embark on your journey alone or with friends.

This is a full-stack project made using the MERN stack. The client-side repository can be [found here](https://github.com/derekdkim/social-media-client).
The goal of this project is to develop a functional social media application from scratch while learning test-driven development for the API.

## Technologies used:

- Node.js/Express (Web server)
- MongoDB/Mongoose (Non-relational Database)
- Heroku (hosting solution)
- Jest (Unit testing framework)
- FontAwesome (free icons)
- Passport.js (Authentication framework & signing JSON Web Tokens)
- bcrypt.js (Password encryption)
- UUID-1345 (UUID generator)
- Supertest/superagent (http request testing library)
- Postman (third-party software for testing requests)

## Usage

For users, it is recommended to visit the Journey Together website.

For other uses,

1. Clone this repo.
2. Create an `.env` file in the project root.
3. Create a MongoDB database on Atlas and obtain its URL.
4. Write the URL in `.env` as `MONGODB_KEY=INSERTURLHERE`.
5. `npm run start`.
6. Open in `http://localhost:3000/`.

## API Features

See `/routes/` for the exact path for requests.

The following is a brief overview of features present in this API.

### Users

- Sign-up new users.
- Log-in existing users and assign JWT.
- Fetch user information.
- Search for users using MongoDB Atlas' elastic search function.
- Change user information such as name and birthday, as well as password.
- Delete Account feature.

### Friends

- Facebook style mutual friend system with friend requests, accept/decline, and delete friend features.
- Friend status plays an important role in being able to view other users' journeys.

### Journeys

- This app's version of "thread" or "group". Create a journey with a name, description, due date (optional), and privacy settings.
- Each journey is grouped in one of three privacy settings: public, friends-only, private. Only applicable groups of users will be able to view certain journeys.
- Users can join journeys as participants. Becoming a participant will bookmark the journey in the user's "My Journeys" page.
- Users can like and unlike journeys, as well as entries and comments within them. Likes don't have any functional purpose other than showing popular something is.
- Journeys can be edited after they are created. Due dates are optional at its creation, and they can be added, modified, or removed at any time. Journeys without due dates are called "Endless Journeys" and are meant to be used for groups and lifelong goals.
- Journeys can be deleted. On deletion, all child entries and comments will be deleted as well.

### Entries

- Entries are posts created within journeys. Parent journeys must be listed for entries to be created.
- Entries can also be modified and deleted similar to journeys.
- Entries can be liked.

### Comments

- Each entry can be commented on and will have its set of comments. Comments must list a parent entry.
- While comments do not directly reference the parent journey, comments are deleted alongside its parent entries when the journey is deleted.
- Comments can be liked.