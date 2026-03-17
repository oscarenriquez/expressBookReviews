const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooksPromise = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!isValid(username) || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const booksList = await getBooksPromise();
    return res.status(200).send(JSON.stringify(booksList, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const booksList = await getBooksPromise();
    const filteredBook = booksList[req.params.isbn];

    if (!filteredBook) {
      return res.status(404).send("Not Found");
    }

    return res.status(200).send(JSON.stringify(filteredBook, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve book details" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const booksList = await getBooksPromise();
    const author = req.params.author;
    const filteredBooks = {};

    for (const key in booksList) {
      const book = booksList[key];
      if (book.author === author) {
        filteredBooks[key] = book;
      }
    }

    return res.status(200).send(JSON.stringify(filteredBooks, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const booksList = await getBooksPromise();
    const title = req.params.title;
    const filteredBooks = {};

    for (const key in booksList) {
      const book = booksList[key];
      if (book.title === title) {
        filteredBooks[key] = book;
      }
    }

    return res.status(200).send(JSON.stringify(filteredBooks, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve books by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const filteredBooks = books[req.params.isbn];
  if (!filteredBooks) {
    return res.status(404).send("Not Found");
  }
  return res.status(200).send(JSON.stringify(filteredBooks.reviews, null, 2));
});

module.exports.general = public_users;
