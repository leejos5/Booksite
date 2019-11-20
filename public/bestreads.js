"use strict";
(function() {

  const URL = "/bestreads/";

  window.addEventListener("load", init);

  /** Initializes the page with the books and click events for switching displays. */
  function init() {
    loadAllBooks();
    id("single-book").classList.add("hidden");
    id("home").addEventListener("click", changeDisplay);
  }

  /** Fetches the information to load the display elements of every book in the API. */
  function loadAllBooks() {
    fetch(URL + "books")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processBooks)
      .catch(handleError);
  }

  /**
   * Processes the book info from the API to create its display.
   * @param {object} response - an object of all the books in the API.
   */
  function processBooks(response) {
    for (let i = 0; i < response.books.length; i++) {
      let book = gen("div");
      book.classList.add("selectable");
      book.addEventListener("click", function() {
        showSingleBook(response.books[i]["book_id"]);
      });

      let cover = gen("img");
      cover.src = "covers/" + response.books[i]["book_id"] + ".jpg";
      book.appendChild(cover);

      let title = gen("p");
      title.textContent = response.books[i]["title"];
      book.appendChild(title);

      id("all-books").appendChild(book);
    }
  }

  /**
   * Displays more information for the selected book, switching the view to a single book.
   * Fetches data for the information, description, and reviews of the selected book.
   * @param {string} bookId - the id of the selected book
   */
  function showSingleBook(bookId) {
    id("book-reviews").innerHTML = "";
    id("book-cover").src = "covers/" + bookId + ".jpg";
    fetchInfo(URL + "info/" + bookId, "json", processInfo);
    fetchInfo(URL + "description/" + bookId, "text", processDesc);
    fetchInfo(URL + "reviews/" + bookId, "json", processReviews);
    id("all-books").classList.add("hidden");
    id("single-book").classList.remove("hidden");
  }

  /**
   * Processes and displays the given information for the book.
   * @param {object} response - info for the book, including title and author.
   */
  function processInfo(response) {
    id("book-title").textContent = response.title;
    id("book-author").textContent = response.author;
  }

  /**
   * Processes and displays the given description for the book.
   * @param {string} response - description of the book.
   */
  function processDesc(response) {
    id("book-description").textContent = response;
  }

  /**
   * Processes and displays the reviews for the given book, including overall rating.
   * @param {object} response - collection of each review made.
   */
  function processReviews(response) {
    let totalScore = 0;
    for (let i = 0; i < response.length; i++) {
      let reviewSection = id("book-reviews");

      let reviewer = gen("h3");
      reviewer.textContent = response[i].name;
      reviewSection.appendChild(reviewer);

      let score = gen("h4");
      let presentedRating = parseInt(response[i].rating);
      totalScore += presentedRating;
      presentedRating = presentedRating.toFixed(1);
      score.textContent = "Rating: " + presentedRating;
      reviewSection.appendChild(score);

      let review = gen("p");
      review.textContent = response[i].text;
      reviewSection.appendChild(review);
    }
    id("book-rating").textContent = (totalScore / response.length).toFixed(1);
  }

  /**
   * FILL THIS STUFF IN
   */
  function changeDisplay() {
    id("single-book").classList.add("hidden");
    id("all-books").classList.remove("hidden");
  }

  /** Reveals the user-friendly error message on the page. */
  function handleError() {
    id("book-data").classList.add("hidden");
    id("error-text").classList.remove("hidden");
  }

  /**
   * Helper function that returns the response's contents if successful. If not, returns the
   * rejected Promise with the corresponding error text.
   * @param {object} response - response to the success check.
   * @returns {object} - valid response if succesful response, otherise rejected promise.
   */
  function checkStatus(response) {
    if (!response.ok) {
      throw Error("Error in request: " + response.statusText);
    }
    return response; // a Response object
  }

  /**
   * Helper function that fetches information from the given url with a response with the given
   * output format and processes that information.
   * @param {string} url - the url to fetch information from.
   * @param {string} outputFormat - the format of the response.
   * @param {function} processData - the function to process the given data.
   */
  function fetchInfo(url, outputFormat, processData) {
    if (outputFormat === "json") {
      fetch(url)
        .then(checkStatus)
        .then(resp => resp.json())
        .then(processData)
        .catch(handleError);
    } else {
      fetch(url)
        .then(checkStatus)
        .then(resp => resp.text())
        .then(processData)
        .catch(handleError);
    }
  }

  /**
   * Helper function to generate the given element.
   * @param {string} element - html tag
   * @return {object} - generated DOM objet of given tag
   */
  function gen(element) {
    return document.createElement(element);
  }

  /**
   * Helper function to find an element by the given id.
   * @param {string} elementId - the id of the element.
   * @return {object} - DOM object associated with the given id.
   */
  function id(elementId) {
    return document.getElementById(elementId);
  }

})();
