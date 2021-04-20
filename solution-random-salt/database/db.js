const { existsSync, writeFileSync } = require("fs");
const { readFile, writeFile } = require("fs/promises");
const path = require("path");

const dbPath = path.join(__dirname, "db.json");
const initialData = { users: [] };

// create db.json if it doesn't exist yet
try {
  const dbFileExists = existsSync(dbPath);
  if (!dbFileExists) {
    writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
} catch (error) {
  console.error("Error creating db.json");
  console.error(error);
}

function getUsers() {
  return readFile(dbPath).then((contents) => JSON.parse(contents));
}

function getUser(email) {
  return readFile(dbPath).then((contents) => {
    const data = JSON.parse(contents);
    const user = data.users.find((user) => user.email === email);
    if (!user) throw new Error(`${email} not found in users`);
    return user;
  });
}

function createUser(user) {
  return readFile(dbPath).then((contents) => {
    const data = JSON.parse(contents);
    const existingUser = data.users.find((u) => u.email === user.email);
    if (existingUser) throw new Error(`${user.email} already exists`);

    user.id = Date.now(); // rudimentary unique ID
    data.users.push(user);
    return writeFile(dbPath, JSON.stringify(data, null, 2)).then(() => user);
  });
}

module.exports = { getUsers, getUser, createUser };
