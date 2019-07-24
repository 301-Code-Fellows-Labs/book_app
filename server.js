'use strict';

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();

// Environment variables
require('dotenv').config();

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true })); // default clientused to send html forms
app.use('/public', express.static('public')); // route to public folder with static files
app.set('view engine', 'ejs'); // setting ejs as view engin for express app

// API Routes
// Renders the search form

app.get('/search', newSearch);
app.get('/', getBooks);


// Creates a new search to the Google Books API
app.post('/searches', createSearch);


// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));


// HELPER FUNCTIONS
function getBooks(request, response) {
  let SQL = 'SELECT * from books;';

  return client.query(SQL)
    .then(results => response.render('pages/index', { results: results.rows }))
    .catch(err => response.status(500).render('pages/error'), {err: 'oops'}); 
}


function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title';
  this.authors = info.authors ? info.authors : 'no author';
  this.description = info.description ? info.description : 'no description';
  this.image = info.imageLinks ? info.imageLinks.smallThumbnail : placeholderImage;
}
// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/index'); //looks in view folder for pages/index
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

