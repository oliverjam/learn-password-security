# Learn password security

Learn the basics of securely storing user passwords on your Node server.

We'll look at why you shouldn't store passwords as plaintext, what hashing and salting are, and how to use the BCrypt algorithm in Node.

## Setup

1. Clone this repo
1. Run `npm install` to install dependencies
1. Run `npm run dev` to start the development server
1. Open `workshop/server.js` in your browser

## Plaintext passwords

Once you've started the dev server open http://localhost:3000 in your browser. You should see a sign up form—use this to create an account, then check the `workshop/database/db.json` file. This is simulating a real database so we can see how our user data is store.

You should see the user you just created in there. Unfortunately you can see your password stored in plaintext. This means anyone with access to this database can read it.

This may not seem that bad at first—you probably trust yourself to be a good developer and not do anything nefarious, but do you trust everyone who will ever have access to this data? Remember that most people re-use passwords for lots of sites, which makes this password extra dangerous.
