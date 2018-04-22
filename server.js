'use strict';

// Application dependencies
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const pg = require('pg');

// Application Setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));


// Application Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// app.use(express.static('./public'));


app.get('/test', (req, res) => res.send('hello world, it works'));

// API Endpoints
app.get('/api/v1/books', (req, res) => {
  console.log('Retreiving all Books');
  client.query(`SELECT book_id, title, author, image_url, isbn FROM books;`)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.get('/api/v1/books/:id', (req, res) => {
  console.log('Server selecting single book', req.params.id)
  client.query(`
  SELECT 
  book_id,
  title,
  isbn,
  author,
  image_url,
  description
  FROM books
  WHERE book_id=$1;
  `,
    [req.params.id])
    .then(function(result) {
      res.send(result.rows[0]);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/api/v1/books', (req, res) => {
  client.query(
    `
    INSERT INTO books (
      title,
      author,
      img_url)
    VALUES ($1, $2, $3)
    ON CONFLICT DO NOTHING
    `,
    [
      req.body.title,
      req.body.author,
      req.body.img_url
    ]),
  function(err) {
    if (err) console.error('error',err);
    res.send('insert complete');
  }
});

app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
