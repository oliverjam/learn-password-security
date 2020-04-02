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

