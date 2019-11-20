"use strict";
const util = require("util");
const express = require("express");
const fs = require("fs").promises;
const glob = require("glob");

const globPromise = util.promisify(glob);

const app = express();

const URL = "/bestreads/";

app.use(express.static("public"));

app.get(URL + "description/:book_id", async (req, res) => {
  let bookId = req.params["book_id"];
  res.type("text");
  try {
    let result = await fs.readFile("books/" + bookId + "/description.txt", "utf8");
    res.send(result);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.status(400).send("No results found for " + bookId + ".");
    } else {
      res.status(500).send("Something went on the server, try again later!");
    }
  }
});

app.get(URL + "info/:book_id", async (req, res) => {
  let bookId = req.params["book_id"];
  try {
    res.type("json");
    let result = await processInfo(bookId);
    res.send(result);
  } catch (error) {
    res.type("text");
    if (error.code === "ENOENT") {
      res.status(400).send("No results found for " + bookId + ".");
    } else {
      res.status(500).send("Something went on the server, try again later!");
    }
  }
});

app.get(URL + "reviews/:book_id", async (req, res) => {
  let bookId = req.params["book_id"];
  try {
    res.type("json");
    let reviews = await globPromise("books/" + bookId + "/review*.txt");
    let result = await processReviews(reviews);
    res.send(result);
  } catch (error) {
    res.type("text");
    if (error.code === "ENOENT") {
      res.status(400).send("No results found for " + bookId + ".");
    } else {
      res.status(500).send("Something went on the server, try again later!");
    }
  }
});

app.get(URL + "books", async (req, res) => {
  try {
    res.type("json");
    let allBooks = await fs.readdir("books");
    let result = await processAllBooks(allBooks);
    res.send(result);
  } catch (error) {
    res.type("text");
    res.status(500).send("Something went on the server, try again later!");
  }
});

async function processInfo(bookId) {
  let contents = await readFileAsync("books/" + bookId + "/info.txt");
  contents = contents.split("\n");
  let jsonInfo = {
    "title": contents[0],
    "author": contents[1]
  };
  return jsonInfo;
}

/**
 * does function stuff
 * @param {string} allBooks - so like a bunch of books
 * @return {object} - json of stuff to return
 */
async function processAllBooks(allBooks) {
  let jsonBooks = {
    books: []
  };
  for (let i = 0; i < allBooks.length; i++) {
    let bookId = allBooks[i];
    let bookTitle = await readFileAsync("books/" + allBooks[i] + "/info.txt");
    bookTitle = bookTitle.substring(0, bookTitle.indexOf("\n"));
    jsonBooks.books.push({
      "title": bookTitle,
      "book_id": bookId
    });
  }
  return jsonBooks;
}

async function readFileAsync(path) {
  try {
    let result = await fs.readFile(path, "utf8");
    return result;
  } catch (error) {
    return error;
  }
}
/**
 * does function stuff
 * @param {object} reviews - so like stuff
 */
async function processReviews(reviews) {
  let jsonReviews = [];
  for (let i = 0; i < reviews.length; i++) {
    let reviewInfo = await fs.readFile(reviews[i], "utf8");
    reviewInfo = reviewInfo.split("\n");
    jsonReviews.push({
      "name": reviewInfo[0],
      "rating": reviewInfo[1],
      "text": reviewInfo[2]
    });
  }
  return jsonReviews;
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
