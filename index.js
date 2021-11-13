const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i2s3w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//middleware
app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    const database = client.db('babys-dream');
    const ProductsCollection = database.collection('products');
    const bookingCollection = database.collection('booking');
    const reviewCollection = database.collection('review');
    const usersCollection = database.collection('users');

    //add products
    app.post('/addProduct', async (req, res) => {
      const product = req.body;
      const result = await ProductsCollection.insertOne(product);
      res.json(result);
    });

    //add user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // update user
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // Make Admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log(user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // add review
    app.post('/getReview', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // GET API
    app.get('/products', async (req, res) => {
      const cursor = ProductsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // GET users
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //Get Reviews
    app.get('/reviews', async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // add booking products
    app.post('/bookingProduct', async (req, res) => {
      const bookingProduct = req.body;
      const result = await bookingCollection.insertOne(bookingProduct);

      res.send(result);
      console.log(result);
    });

    //get my booking items
    app.get('/myBooking/:email', async (req, res) => {
      const result = await bookingCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    //get all booking items
    app.get('/allBooking', async (req, res) => {
      const result = await bookingCollection.find({}).toArray();
      res.send(result);
    });

    //delete booking product
    app.delete('/deleteBooking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await bookingCollection.deleteOne(query);
      res.send(query);
    });

    //delete product
    app.delete('/deleteProduct/:id', async (req, res) => {
      const id = req.params.id;
      const result = await ProductsCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);

      console.log(result);
    });

    //Shipped product
    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;
      console.log(id);
      const filter = { _id: id };

      bookingCollection
        .updateOne(filter, {
          $set: {
            status: updatedStatus.status,
          },
        })
        .then(result => {
          res.send(result);
          console.log(result);
        });
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Babyss dream server!');
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
