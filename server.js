'use strict';

// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();

// Environment variables
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(express.urlencoded({ extended: true })); // default clientused to send html forms
app.use('/public', express.static('public')); // route to public folder with static files
// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
app.get('/', getBooks); //books from DB
app.get('/search', newSearch);
app.post('/searches', createSearch); // Creates a new search to the Google Books API
app.post('/books', createBook);
app.get('/books/:book_id', getOneBook);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));


// HELPER FUNCTIONS
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title';
  this.authors = info.authors ? info.authors : 'no author';
  this.description = info.description ? info.description : 'no description';
  this.image = info.imageLinks ? info.imageLinks.smallThumbnail : placeholderImage;
}

function getBooks(request, response) {
  let SQL = 'SELECT * from books;';

  return client.query(SQL)
    .then(results => {
      if (results.rows.rowCount === 0) {
        response.render('pages/search');
      } else {
        response.render('pages/index', { books: results.rows })
      }
    })
    .catch(err => response.status(500).render('pages/error'), {err: 'oops'}); 
}

function createBook(request, response) {
  let normalizedShelf = request.body.bookshelf.toLowerCase();

  let { title, author, isbn, image_url, description } = request.body;
  let SQL = 'INSERT INTO books(title, author, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6);';
  let values = [title, author, isbn, image_url, description, normalizedShelf];

  return client.query(SQL, values)
    .then(() => {
      SQL = 'SELECT * FROM books WHERE isbn=$1;';
      values = [request.body.isbn];
      return client.query(SQL, values)
        .then(result => response.redirect(`/books/${result.rows[0].id}`))
        .catch(err => response.status(500).render('pages/error'), {err: 'oops'}); 
    })
    .catch(err => response.status(500).render('pages/error'), {err: 'oops'}); 
}

function getOneBook(request, response) {
  let SQL = `SELECT * from books WHERE id=${request.params.book_id};`;
  return client.query(SQL)
    .then(result => {
      console.log(result);
      response.render('pages/books/show', { book: result.rows[0]})
    })
    .catch(err => response.status(500).render('pages/error'), {err: 'oops'});
}


function newSearch(request, response) {
  response.render('pages/search'); //looks in view folder for pages/search
}

// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }))
    .catch(err => response.status(500).render('pages/error'), {err: 'oops'});
}

