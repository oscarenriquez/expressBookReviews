const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return typeof username === "string" && username.trim().length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(
    (user) => user.username === username && user.password === password
  );
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!isValid(username) || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid login. Check username and password",
    });
  }

  const accessToken = jwt.sign({ username }, "fingerprint_customer", {
    expiresIn: "1h",
  });

  req.session.authorization = { accessToken };

  return res.status(200).json({
    message: "User successfully logged in",
    accessToken,
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const { review } = req.query;
  const username = req.user.username;

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added or updated successfully",
    reviews: book.reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.user.username;

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews,
  });
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
