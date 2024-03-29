'use strict';

// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const methodOverride = require('method-override');

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

app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));

// API Routes
app.get('/', getBooks); //books from DB
app.get('/search', newSearch);
app.post('/searches', createSearch); // Creates a new search to the Google Books API
app.post('/books', createBook);
app.get('/books/:book_id', getOneBook);
app.put('/books/:book_id', updateBook);
app.delete('/books/:id', deleteBook);
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title';
  this.author = info.authors ? info.authors[0] : 'No author available';
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.description = info.description ? info.description : 'no description';
  this.image = info.imageLinks ? info.imageLinks.smallThumbnail : placeholderImage;
}

function getBooks(request, response) {
  let SQL = 'SELECT * from books;';

  return client.query(SQL)
    .then(results => {
      if (results.rows.rowCount === 0) {
        response.render('pages/searches/search');
      } else {
        response.render('pages/index', { books: results.rows })
      }
    })
    .catch(() => response.status(500).render('pages/error'), {err: 'oops'}); 
}


function getOneBook(request, response) {
  let SQL = `SELECT * from books WHERE id=${request.params.book_id};`;
  return client.query(SQL)
    .then(result => {
      response.render('pages/books/show', { book: result.rows[0]})
    })
    .catch(() => response.status(500).render('pages/error'), {err: 'oops'});
}


function newSearch(request, response) {
  response.render('pages/searches/search'); //looks in view folder for pages/search
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }))
    .catch(() => response.status(500).render('pages/error'), {err: 'oops'});
}

function createBook(request, response) {
  let { title, author, isbn, image_url, description, bookshelf} = request.body;
  let SQL = 'INSERT INTO books(title, author, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6);';
  let values = [title, author, isbn, image_url, description, bookshelf];

  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(() => response.status(500).render('pages/error'), {err: 'oops'});
}

function deleteBook(request, response) {
  let SQL = 'DELETE FROM books WHERE id=$1;';
  let values = [request.params.id];

  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(() => response.status(500).render('pages/error'), {err: 'oops'});
}

function updateBook(request, response) {
  let bookshelf = request.body.bookshelf;
  let SQL = `UPDATE books SET bookshelf=$1 WHERE id=$2;`;
  let values = [bookshelf, request.params.book_id];

  return client.query(SQL, values)
    .then(()=>response.redirect('/'))
    .catch(error => response.send(error));
}
