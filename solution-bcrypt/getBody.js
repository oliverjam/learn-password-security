function getBody(request) {
  let body = "";
  return new Promise((resolve, reject) => {
    request.on("data", chunk => (body += chunk));
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

module.exports = getBody;
