/*
 * Joshua Lee
 * November 19th, 2019
 * CSE 154 AE
 *
 * This is the documentation for the app.js server for the Bestreads API. It provides information
 * about the list of books, including author, description, and reviews.
 *
 * ***endpoints***
 * All endpoints are get requests.
 *
 * 1: /bestreads/description/:book_id
 * Provides the description for the selected book.
 * Response format: text/plain
 * Parameters: :book_id - the id of the selected book
 * Possible errors: invalid parameter (500)
 *                  server error(400)
 * Example request: "/bestreads/description/harrypotter"
 * Example response:
 * ```
 * Harry Potter is lucky to reach the age of thirteen, since he has already survived
 * the murderous attacks of the feared Dark Lord on more than one occasion. But his
 * hopes for a quiet term concentrating on Quidditch are dashed when a maniacal
 * mass-murderer escapes from Azkaban, pursued by the soul-sucking Dementors who
 * guard the prison. It's assumed that Hogwarts is the safest place for Harry to
 * be. But is it a coincidence that he can feel eyes watching him in the dark,
 * and should he be taking Professor Trelawney's ghoulish predictions seriously?
 * ```
 *
 * 2: /bestreads/info/:book_id
 * Provides the general information for the selected book.
 * Response format: application/json
 * Parameters: :book_id - the id of the selected book
 * Possible errors: invalid parameter (500)
 *                  server error (400)
 * Example request: "/bestreads/info/harrypotter"
 * Example response:
 * ```
 * json
 * {
 *   "title": "Harry Potter and the Prisoner of Azkaban (Harry Potter #3)",
 *   "author": "by J.K. Rowling, Mary GrandPre (Illustrator)",
 * }
 * ```
 *
 * 3: /bestreads/reviews/:book_id
 * Provides information of the book's reviews, including the reviewer and rating from each reviewer.
 * Response format: application/json
 * Parameters: :book_id - the id of the selected book
 * Possible errors: invalid parameter (500)
 *                   server error (400)
 * Example request: "/bestreads/reviews/harrypotter"
 * Example response:
 * '''
 * json
 * [
 *    {
 *       "name": "Wil Wheaton",
 *       "rating": 4.1,
 *       "text": "I'm beginning to wonder if there will ever be a Defense Against The Dark Arts
                  teacher who is just a teacher."
 *   },
 *   {
 *       "name": "Zoe",
 *       "rating": 4.8,
 *       "text": "Yup yup yup I love this book"
 *   },
 *   {
 *       "name": "Kiki",
 *       "rating": 5,
 *       "text": "Literally one of the best books I've ever read. I was chained to it for two days.
                  I cried and laughed and yelled AHH when all of the action went down."
 *   }
 * ]
 * ```
 *
 * 4: /bestreads/books
 * Gets a list of all the books on the website.
 * Response format: application/json
 * Possible errors: server error (400)
 * Example request: "/bestreads/books"
 * Example response:
 * '''
 * json
 * {
 *   "books": [
 *       {
 *           "title": "2001: A Space Odyssey",
 *           "book_id": "2001spaceodyssey"
 *       },
 *       {
 *           "title": "Alanna: The First Adventure (Song of the Lioness #1)",
 *           "book_id": "alannathefirstadventure"
 *       },
 *       {
 *           "title": "Alice in Wonderland",
 *           "book_id": "aliceinwonderland"
 *       },
 *       ... (one entry like this for each folder inside books/)
 *   ]
 * }
 * '''
 */

"use strict";
const util = require("util");
const express = require("express");
const fs = require("fs").promises;
const glob = require("glob");

const globPromise = util.promisify(glob);

const app = express();

const URL = "/bestreads/";

app.use(express.static("public"));

/** Gets a description of the chosen book in text format. */
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

/** Sends the basic information for the selected book in json format. */
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

/** Sends the review info for the chosen book, including author and rating. */
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

/** Sends a list of all the books in the API. */
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

/**
 * processes the info for the given book.
 * @param {string} bookId - the id of the selected book.
 * @return {array} - JSON object of the book's info.
 */
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
 * Processes the information for each of the books to be displayed on the page.
 * @param {string} allBooks - names of all the books.
 * @return {object} - JSON Object of all the books' basic information.
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

/**
 * Processes the information for each review for the selected book.
 * @param {object} reviews - the obejct with information for each of the reviews.
 * @return {object}- JSON object with sorted information for each review.
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

/**
 * Helper function to read the file at the given path asynchronously.
 * @param {string} path - the path of the desired file.
 * @return {object} - if error, rejected promise; if not, returns the file contents.
 */
async function readFileAsync(path) {
  try {
    let result = await fs.readFile(path, "utf8");
    return result;
  } catch (error) {
    return error;
  }
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
