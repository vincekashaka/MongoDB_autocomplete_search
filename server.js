const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { request } = require('http');
const { response } = require('express');
const port = process.env.PORT || 5000;

const app = express();

let db,
  dbConnectionStr = process.env.MONGO_URI,
  dbName = 'sample_mflix',
  collection;

MongoClient.connect(dbConnectionStr).then((client) => {
  console.log(`Connected to MongoDB at ${port}`.cyan.underline);
  db = client.db(dbName);
  collection = db.collection('movies');
});

//MiddleWare
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors);

//Bring autocomplete while typing
app.get('/serarch', async (request, response) => {
  try {
    let result = await collection
      .aggregate([
        {
          $search: {
            autocomplete: {
              query: `${request.query.query}`,
              path: 'title',
              fuzzy: {
                maxEdits: 2,
                prefixLength: 3,
              },
            },
          },
        },
      ])
      .toArray();
    response.find(result);
  } catch (error) {
    response.status(401).send({ message: error.message });
  }
});

//Get the movie results
app.get('/get/:id', async (request, response) => {
  try {
    let result = await collection.findOne({
      _id: ObjectId(request.params.id),
    });
    response.send(result);
  } catch (error) {
    response.status(401).send({ message: error.message });
  }
});
app.listen(port, () => console.log(`Server started on port ${port}`));
