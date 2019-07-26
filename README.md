# book_app

**Author**: Nadya Ilinskaya
**Version**: 4.0.0 

## Overview
Basic full stack application for a book list which includes the ability to search the Google Books API, adds books to a database, and renders those books from a PostgreSQL database. You can also update the details of a book or remove it from the collection.

## Getting Started
You need to install npm, psql, express, ejs, superagent, postgres and method-override to run this app locally: 

* ```npm init```
* ```npm install --save express dotenv superagent ejs pg method-override```


## Architecture
App build with Java Script, Node, Express, Postgres and Google Books API


## Change Log
07-23-2019 2:00pm - Application now has a fully-functional express server, with GET and POST routes for the book resource.

07-24-2019 2:00pm - Application now has a DataBase and showing saved information

07-25-2019 2:00pm - Application now has Update functionality

07-26-2019 2:00pm - Application now has normalized DataBase and Save functionality

## Notes
Application modifided the way that only bookshelf can be updated, even though initially it supported ability to update all fields. It's just doesn't seem have any sence to update book's autor or title.