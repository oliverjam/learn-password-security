function get(request, response) {
  response.writeHead(200, { "content-type": "text/html" });
  response.end(`
    <h1>Create an account</h1>
    <p>New users <a href="sign-up">sign up for an account</a> or existing users <a href="log-in">log in</a>
  `);
}

module.exports = { get };
