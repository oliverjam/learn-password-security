const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "db.json");
const initialData = { users: [] };

// create db.json if it doesn't exist yet
try {
  const dbFileExists = fs.existsSync(dbPath);
  if (!dbFileExists) {
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
} catch (error) {
  console.error("Error creating db.json");
  console.error(error);
}

function getUsers() {
  return new Promise((resolve, reject) => {
    fs.readFile(dbPath, (error, contents) => {
      if (error) {
        reject(error);
      } else {
        const data = JSON.parse(contents);
        resolve(data.users);
      }
    });
  });
}

function getUser(email) {
  return new Promise((resolve, reject) => {
    fs.readFile(dbPath, (error, contents) => {
      if (error) {
        reject(error);
      } else {
        const data = JSON.parse(contents);
        const user = data.users.find(user => user.email === email);
        if (!user) {
          reject(new Error(`${email} not found in users`));
        } else {
          resolve(user);
        }
      }
    });
  });
}

function createUser(user) {
  return new Promise((resolve, reject) => {
    fs.readFile(dbPath, (error, contents) => {
      if (error) {
        reject(error);
      } else {
        const data = JSON.parse(contents);
        const existingUser = data.users.find(u => u.email === user.email);
        if (existingUser) {
          reject(new Error(`${user.email} already exists`));
        } else {
          user.id = Date.now(); // rudimentary unique ID
          data.users.push(user);
          fs.writeFile(dbPath, JSON.stringify(data, null, 2), error => {});
          resolve(user);
        }
      }
    });
  });
}

module.exports = { getUsers, getUser, createUser };
