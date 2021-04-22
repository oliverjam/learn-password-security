# Learn password security

Learn the basics of securely storing user passwords on your Node server.

We'll look at why you shouldn't store passwords as plaintext, what hashing and salting are, and how to use the BCrypt algorithm in Node.

## Setup

1. Clone this repo and `cd` into the directory
1. Run `npm install` to install dependencies
1. Run `npm run dev` to start the development server
1. Open http://localhost:3000 in your browser

### Project structure

There are five endpoints:

- `"GET /"`: homepage with links to `/sign-up` and `/log-in`
- `"GET /sign-up"`: form to create a new user
- `"POST /sign-up"`: new user form submits data to here
- `"GET /log-in"`: form to sign in to an existing account
- `"POST /log-in"` sign in form submits data to here

Data is stored in the `workshop/database/db.json` file. You should see users added to the file as you submit the sign-up form.

The `POST /log-in` handler finds the user with a matching email in the "database", then compares the submitted password with the stored user's password. If they match the user is "logged in".

Don't spend too long on each challenge: you won't be implementing password hashing yourself in a real app as it's complicated and dangerous. The steps are there as a learning exercise—the final challenge using the `bcryptjs` library is how you'd actually store passwords in a real project.

## Plaintext passwords

Once you've started the dev server open http://localhost:3000 in your browser. You should see a sign up form—use this to create an account, then check the `workshop/database/db.json` file. This is simulating a real database so we can see how our user data is stored.

You should see the user you just created in there. Unfortunately you can see your password stored in plaintext. This means anyone with access to this database can read it.

There are a few problems with this:

1. You (or a future employee of your company) know all users' password
1. Passwords are generally re-used for other websites
1. If a hacker steals your database they immediately know all users' passwords

We have a problem: storing the password as plaintext is bad, but we need to be able to compare a submitted password to a saved one in order to verify users and log them in. This is where hashing is useful.

## Hashing passwords

Hashing is when you use a mathematical process (algorithm) to convert a string into a different one. Hashes are:

- One-way: it should be impossible to reverse the process.
- Deterministic: hashing the same string always gives the same result.
- Unique: hashing a different string should never create the same result.

For example hashing "hunter2" with the popular "sha256" algorithm always gives us "f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7". There is no way to turn that hash _back_ into "hunter2" again, so it's safe to store. No other password will create an identical hash.

When a new user signs up we hash their password and store the hash in the database. When they next log in we ask for their password again, hash it again, then compare that hash to the one we have stored. The hashes will only match if the input password was the same both times.

Here's how we'd create the initial hash using the built-in Node `crypto` module:

```js
const crypto = require("crypto");

const password = "hunter2";

const hashedPassword = crypto
  .createHash("sha256")
  .update(password)
  .digest("hex");
// "f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7"
```

We have to specify which algorithm we want to use (`"sha256"`) and what encoding the result (or "digest") string has (hexadecimal).

Here's roughly how we would verify a user when they signed in again later:

```js
const savedUser = model.getUser(email); // this would normally be async
const savedHashedPassword = savedUser.password;
if (hashedPassword !== savedHashedPassword) {
  response.status(401).send("Unauthenticated");
} else {
  // they are logged in
}
```

### Hashing challenge

First we need to stop saving users' passwords in plaintext.

- Edit the `post` function in `workshop/handlers/signUp.js`
- We want to hash the submitted password using the built-in `crypto.createHash()` method
- Store the hash instead of the plaintext password in the database
- Create a new user at `/sign-up`: you should see a random string password appear in `db.json`
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

<details>
<summary>Quick solution</summary>

```js
// signUp.js

function post(request, response) {
  const { email, password } = request.body;
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  model.createUser({ email, password: hashedPassword }).then(() => {
    response.send(`<h1>Welcome ${email}</h1>`);
  });
  // plus error handling
}
```

</details>

Then we need to make our logging in comparison work.

- Edit the `post` function in `workshop/handlers/logIn.js`
- We need to hash the submitted password before we compare it to the stored hash
- You should be able to log in as the user you just created

<details>
<summary>Quick solution</summary>

```js
// logIn.js

function post(request, response) {
  const { email, password } = request.body;
  model.getUser(email).then((user) => {
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    if (user.password !== hashedPassword) {
      throw new Error("Password mismatch");
    } else {
      response.send(`<h1>Welcome back, ${email}</h1>`);
    }
  });
  // plus error handling
}
```

</details>

## Rainbow tables

There are still some issues with our hashed passwords. The only way for a hacker with a stolen database to figure out the passwords is with a "brute force" attack. This is where they use software to automatically try a huge list of possible passwords, hashing each one then comparing it to the passwords in the database.

A good hash algorithm is deliberately quite slow. This limits a hacker who has stolen a database—the brute force attack will take a long time since they'll have to try thousands of passwords. Hackers can speed this process up by using "rainbow tables". This is a pre-hashed list of common words so the hacker doesn't have to hash each password to find a match in the database. For example instead of:

```
hash(password1) ---(slooow)---> "nkjadfjknadf2e" (no match)
hash(password2) ---(slooow)---> "kmnsdnnmkd2eeb" (no match)
...
```

They can skip the hashing part and just try the hashes directly:

```
"nkjadfjknadf2e" (no match)
"kmnsdnnmkd2eeb" (no match)
...
```

### Salting challenge

We can prevent the use of rainbow tables by "salting" our passwords. This means adding a random string to the password before hashing it. That will ensure our password hashes are unique to our app, and so won't show up in any rainbow tables.

For example "cupcake" hashed using SHA256 is always `"b0eaeafbf3..."`. That means the hash can be published in rainbow tables. If we instead add a salt to the password to make `"kjnafn9nbjka2kjn.cupcake"` then the hash will be `"6bc8571635..."`, which won't appear in any rainbow table.

- Add a long string to the password before you hash it in `workshop/handlers/signUp.js`

  <details>
  <summary>Quick solution</summary>

  ```js
  // signUp.js

  const SALT = "u893qhdnk&892jn9";

  function post(request, response) {
    const { email, password } = request.body;
    const hashedPassword = crypto
      .createHash("sha256")
      .update(SALT + password)
      .digest("hex");
    model.createUser({ email, password: hashedPassword });
    // ...
  }
  ```

  </details>

- Add the same string to the password before you hash it in `workshop/handlers/logIn.js` so you can correctly compare it to the hash in the database

  <details>
  <summary>Quick solution</summary>

  ```js
  // logIn.js
  const SALT = "u893qhdnk&892jn9";

  function post(request, response) {
    const { email, password } = request.body;
    model.getUser(email).then((user) => {
      const hashedPassword = crypto
        .createHash("sha256")
        .update(SALT + password)
        .digest("hex");
      if (user.password !== hashedPassword) {
        throw new Error("Password mismatch");
      } else {
        // ...
      }
    });
  }
  ```

  </details>

You have to use the **same salt** each time, otherwise your comparison will fail.

## Random salt

We still have a security flaw here: we're using the same salt for every password, which means our hashes won't be unique. If you create two new users with the same password you should see the same hash in `db.json`. This is a problem because as soon as a hacker cracks one hash they'll have access to all the duplicate passwords.

We can solve this problem by creating a _random_ salt to add to each password. This will ensure that each hash is totally unique, even if the password is the same.

This has an additional complication: we have to store the random salt along with the password. We need to use it to hash the password a user submits when they log in so that we can correctly compare with the stored hash. We can concatenate the salt onto the final hash string:

```js
const SALT = crypto.randomBytes(12).toString("hex"); // random 12 byte string
const hash = crypto
  .createHash("sha256")
  .update(SALT + password) // create a unique hash using the random salt
  .digest("hex");
const hashToSave = SALT + "." + hash;
```

Then when we retrieve the password from the database we can split the hash on the `.` to get the salt and hash.

```js
const hashArray = dbUser.password.split(".");
const salt = hashArray[0];
const hash = hashArray[1];
```

### Random salt challenge

- Edit the `post` function in `workshop/handlers/signUp.js`
  - Add a random string to the password before you hash it so you you're storing a unique hash in the database
- Edit the `post` function in `workshop/handlers/logIn.js`
  - Get the salt + hash from the database, then use the salt to hash the submitted password and compare it to the stored hash

<details>
<summary>Quick solution</summary>

```js
// signUp.js

function post(request, response) {
  const { email, password } = request.body;
  const salt = crypto.randomBytes(12).toString("hex");
  const hashedPassword = crypto
    .createHash("sha256")
    .update(salt + password)
    .digest("hex");
  model
    .createUser({ email, password: salt + "." + hashedPassword })
    .then(() => {
      response.send(`<h1>Welcome ${email}</h1>`);
    });
  // ...
}
```

```js
// logIn.js

function post(request, response) {
  const { email, password } = request.body;
  model.getUser(email).then((user) => {
    const hashAndSalt = user.password.split(".");
    const storedSalt = hashAndSalt[0];
    const storedPassword = hashAndSalt[1];
    const hashedPassword = crypto
      .createHash("sha256")
      .update(storedSalt + password)
      .digest("hex");
    if (storedPassword !== hashedPassword) {
      throw new Error("Password mismatch");
    } else {
      response.send(`<h1>Welcome back, ${email}</h1>`);
    }
  });
  // ...
}
```

</details>

## BCrypt

It's annoying having to implement all this stuff ourselves. It's likely we'll mess something up. There are also better-designed algorithms for password hashing. A popular one is called BCrypt. It's designed specifically for passwords, and (in computer terms) is _very_ slow. This isn't noticeable to users but makes a brute-force attack much more difficult for a hacker.

### `bcryptjs` challenge

We'll be using the [`bcryptjs`](https://www.npmjs.com/package/bcryptjs) library (avoid the `bcrypt` one, which has C++ dependencies and doesn't work on some systems).

Since BCrypt is supposed to be slow the implementation is _asynchronous_. So the library's methods return promises. It has a method for generating a hash. This takes the string to hash and a number representing how strong the salt should be (the higher the number the longer it will take to hash):

```js
bcrypt.hash(password, 10).then((hash) => console.log(hash));
// "$2a$10$MFOIdSobXg.x3ZUfrB2VX.C49DYocYGtBQVJ78ZsC2YwgrALIn1oC"
```

It also has a method for comparing a string to a stored hash. This takes the (unhashed) string to compare as the first argument and the hash as the second argument:

```js
bcrypt.compare("hunter2", storedHash).then((match) => console.log(match));
// Logs: true if they match, false if not
```

BCrypt automatically stores the salt as part of the hash, so you don't need to implement that part yourself.

- Run `npm install bcryptjs` to install the library
- Use `bcrypt.hash()` to hash your password before saving to the DB in `signUp.js`
  <details>
  <summary>Quick solution</summary>

  ```js
  //signUp.js

  function post(request, response) {
    const { email, password } = request.body;
    bcrypt
      .hash(password, 10))
      .then((hash) => model.createUser({ email, password: hash }))
      .then(() => {
        response.send(`<h1>Thanks for signing up, ${email}</h1>`);
      });
    // ...
  }
  ```

  </details>

- Use `bcrypt.compare()` to compare the submitted password to the stored hash in `logIn.js`
  <details>
  <summary>Quick solution</summary>

  ```js
  //logIn.js

  function post(request, response) {
    const { email, password } = request.body;
    model
      .getUser(email)
      .then((dbUser) => bcrypt.compare(password, dbUser.password))
      .then((match) => {
        if (!match) throw new Error("Password mismatch");
        response.send(`<h1>Welcome back, ${email}</h1>`);
      });
    // ...
  }
  ```

</details>
