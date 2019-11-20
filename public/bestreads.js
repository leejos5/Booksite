"use strict";
(function() {

  const URL = "/bestreads/";

  window.addEventListener("load", init);

  function init() {
    loadAllBooks();
    id("single-book").classList.add("hidden");
    id("home").addEventListener("click", changeDisplay);
  }

  function loadAllBooks() {
    fetch(URL + "books")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processBooks)
      .catch(handleError);
  }

  /**
   * FILL THIS STUFF IN
   * @param {object} response - FILL THIS STUFF IN
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
   * FILL THIS STUFF IN
   * @param {string} bookId - FILL THIS STUFF IN
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
   * FILL THIS STUFF IN
   * @param {object} response - FILL THIS STUFF IN
   */
  function processInfo(response) {
    id("book-title").textContent = response.title;
    id("book-author").textContent = response.author;
  }

  /**
   * FILL THIS STUFF IN
   * @param {object} response - FILL THIS STUFF IN
   */
  function processDesc(response) {
    id("book-description").textContent = response;
  }

  /**
   * FILL THIS STUFF IN
   * @param {object} response - FILL THIS STUFF IN
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

  function handleError(error) {
    id("book-data").classList.add("hidden");
    id("error-text").classList.remove("hidden");
  }

  /**
   * Helper function that returns the response'scontents if successful. If not, returns the rejected
   * Promise with the corresponding error text.
   * @param {object} response - response to the success check.
   * @returns {object} - valid response if succesful response, otherise rejected promise.
   */
  function checkStatus(response) {
    if (!response.ok) {
      throw Error("Error in request: " + response.statusText);
    }
    return response; // a Response object
  }

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

  function gen(element) {
    return document.createElement(element);
  }

  function id(elementId) {
    return document.getElementById(elementId);
  }

})();
