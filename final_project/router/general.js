const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL of this server, used by the Axios-based routes (Tasks 10-13)
const BASE_URL = "http://localhost:5000";

// Task 6: Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Unable to register user. Username and password are required." });
  }

  if (isValid(username)) {
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
  } else {
    return res.status(409).json({ message: "User already exists!" });
  }
});

// Task 1: Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
 });

// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const booksbyauthor = [];

  // Obtain all the keys for the 'books' object and check each book's author
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author) {
      booksbyauthor.push({ "isbn": isbn, "title": books[isbn].title, "reviews": books[isbn].reviews });
    }
  });

  if (booksbyauthor.length > 0) {
    return res.send(JSON.stringify({ booksbyauthor }, null, 4));
  }
  return res.status(404).json({ message: `No books found by author ${req.params.author}` });
});

// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const booksbytitle = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title) {
      booksbytitle.push({ "isbn": isbn, "author": books[isbn].author, "reviews": books[isbn].reviews });
    }
  });

  if (booksbytitle.length > 0) {
    return res.send(JSON.stringify({ booksbytitle }, null, 4));
  }
  return res.status(404).json({ message: `No books found with title ${req.params.title}` });
});

// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  const reviews = books[isbn].reviews;
  if (Object.keys(reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }
  return res.send(JSON.stringify(reviews, null, 4));
});


/* ------------------------------------------------------------------
 * Tasks 10-13: the same functionality as Tasks 1-4, implemented with
 * async-await and Axios. Each route uses Axios to request the data
 * from the corresponding endpoint above and returns the result.
 * ------------------------------------------------------------------ */

// Task 10: Get the list of books available in the shop using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the book list", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using async-await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: `Error fetching book with ISBN ${isbn}`, error: error.message });
  }
});

// Task 12: Get book details based on author using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: `Error fetching books by author ${author}`, error: error.message });
  }
});

// Task 13: Get book details based on title using async-await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: `Error fetching books with title ${title}`, error: error.message });
  }
});

module.exports.general = public_users;
