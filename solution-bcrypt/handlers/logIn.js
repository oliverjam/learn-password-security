const bcrypt = require("bcryptjs");
const getBody = require("../getBody");
const model = require("../database/db");

function get(request, response) {
  response.writeHead(200, { "content-type": "text/html" });
  response.end(`
    <h1>Log in</h1>
    <form action="log-in" method="POST">
      <label for="email">Email</label>
      <input type="email" id="email" name="email">
      <label for="password">Password</label>
      <input type="password" id="password" name="password">
      <button>Log in</button>
    </form>
  `);
}

function post(request, response) {
  getBody(request)
    .then(body => {
      const user = new URLSearchParams(body);
      const email = user.get("email");
      const password = user.get("password");
      model
        .getUser(email)
        .then(dbUser => bcrypt.compare(password, dbUser.password))
        .then(match => {
          if (!match) throw new Error("Password mismatch");
          response.writeHead(200, { "content-type": "text/html" });
          response.end(`
            <h1>Welcome back, ${email}</h1>
          `);
        })
        .catch(error => {
          console.error(error);
          response.writeHead(401, { "content-type": "text/html" });
          response.end(`
            <h1>Something went wrong, sorry</h1>
            <p>User not found</p>
          `);
        });
    })
    .catch(error => {
      console.error(error);
      response.writeHead(500, { "content-type": "text/html" });
      response.end(`
        <h1>Something went wrong, sorry</h1>
      `);
    });
}

module.exports = { get, post };
