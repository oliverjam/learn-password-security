const home = require("./handlers/home");
const logIn = require("./handlers/logIn");
const signUp = require("./handlers/signUp");

function router(request, response) {
  const { url, method } = request;
  const route = `${method} ${url}`; // e.g. "GET /" or "POST /sign-up"
  switch (route) {
    case "GET /":
      return home.get(request, response);
    case "GET /sign-up":
      return signUp.get(request, response);
    case "POST /sign-up":
      return signUp.post(request, response);
    case "GET /log-in":
      return logIn.get(request, response);
    case "POST /log-in":
      return logIn.post(request, response);
    default:
      response.writeHead(404, { "content-type": "text/html" });
      response.end(`<h1>Not found</h1>`);
  }
}

module.exports = router;
