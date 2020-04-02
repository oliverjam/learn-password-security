# Learn password security

Learn the basics of securely storing user passwords on your Node server.

We'll look at why you shouldn't store passwords as plaintext, what hashing and salting are, and how to use the BCrypt algorithm in Node.

## Setup

1. Clone this repo
1. Run `npm install` to install dependencies
1. Run `npm run dev` to start the development server
1. Open `workshop/server.js` in your browser

### Project structure

There are five endpoints:

- `"GET /"`: homepage with links to `/sign-up` and `/log-in`
- `"GET /sign-up"`: form to create a new user
- `"POST /sign-up"`: new user form submits data to here
- `"GET /log-in"`: form to sign in to an existing account
- `"POST /log-in"` sign in form submits data to here

Data is stored in the `workshop/database/db.json` file. You should see users added to the file as you submit the sign-up form.

The `POST /log-in` handler finds the user with a matching email in the "database", then compares the submitted password with the stored user's password. If they match the user is "logged in".

## Plaintext passwords

Once you've started the dev server open http://localhost:3000 in your browser. You should see a sign up form—use this to create an account, then check the `workshop/database/db.json` file. This is simulating a real database so we can see how our user data is stored.

You should see the user you just created in there. Unfortunately you can see your password stored in plaintext. This means anyone with access to this database can read it.

There are a few problems with this:

1. You (or a future employee of your company) know all users' password
1. Passwords are generally re-used for other websites
1. If a hacker steals your database they immediately know all users' passwords

We have a problem: storing the password as plaintext is bad, but we need to be able to compare a submitted password to a saved one in order to verify users and log them in. This is where hashing is useful.

## Hashing passwords

Hashing is when you use a mathematical process (algorithm) to convert a string into a different one. They are designed to be one-way: it should be very difficult to reverse the process.

The process is also "deterministic", which means **hashing the same string always gives the same result**. This is how we can still verify users: if we hash the password `"hunter2"` we'll always get the same result. This is how we'd do it with Node's built-in `crypto` module:

```js
const crypto = require("crypto");

const hashedPassword = crypto
  .createHash("sha256")
  .update("hunter2")
  .digest("hex");
// "f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7"
```

We have to specify which algorithm we want to use (`"sha256"`) and what encoding the result (or "digest") string has (hexdecimal).

To verify a user we can hash the password when they sign up, then store the hash. Then when a user logs in we hash the submitted password, find a matching user in the database then compare the two hashes to see if they match. Here's a simplified example:

```js
const savedUser = model.getUser(email); // this would normally be async
const savedHashedPassword = savedUser.password;
if (hashedPassword !== savedHashedPassword) {
  response.writeHead(401);
  response.end("Unauthenticated");
} else {
  // they are logged in
}
```

### Hashing challenge

First we need to stop saving users' passwords in plaintext.

- Edit the `post` function in `workshop/handlers/signUp.js`
- We want to hash the submitted password using the built-in `crypto.createHash()` method
- Store the hash instead of the plaintext password in the database
- Create a new user to test: you should see a random string password appear in `db.json`
  ```json
  {
    "users": [
      {
        "email": "test@test.co",
        "password": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        "id": 1585842736171
      }
    ]
  }
  ```

Then we need to make our logging in comparison work.

- Edit the `post` function in `workshop/handlers/logIn.js`
- We need to hash the submitted password before we compare it to the stored hash
- You should be able to log in as the user you just created
