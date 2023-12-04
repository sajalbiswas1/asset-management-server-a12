const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000


// middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2fbewnn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db("assetManagement").collection("users");
    const aboutCollection = client.db("assetManagement").collection("about");
    const packageCollection = client.db("assetManagement").collection("packages");
    const assetCollection = client.db("assetManagement").collection("assets");
    const customCollection = client.db("assetManagement").collection("custom");
    const requestCollection = client.db("assetManagement").collection("requests");
    const teamCollection = client.db("assetManagement").collection("teams");


    //user section
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get('/users/v2', async (req, res) => {
      let query = {};
      // console.log(req.query)
      if (req?.query?.team) {
        query = { email: req.query.team }
      }
      const {team} = await userCollection.findOne(query);
      // console.log(userData)
      const query1 = {team:team}
      const cursor = userCollection.find(query1);
      // console.log(cursor)
      const result = await cursor.toArray()
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      //user do not exists
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      // console.log(query)
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.patch('/users/v5', async (req, res) => {
      const id = req.params.id;
      const item = req.query;
      const query = {email: req.query.email}
      // console.log(query)
      const {_id:idx} = await userCollection.findOne(query);
      const filter = { _id: new ObjectId(idx) }
      // console.log('team hello world',item,id)
      const updatedDoc = {
        $set: {
          team: item.team,
        }
      }
      // console.log(filter)
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    app.get('/users/v1', async (req, res) => {
      let query = {};
      // console.log(req.query)
      if (req?.query?.email) {
        query = { email: req.query.email }
      }
      const cursor = await userCollection.findOne(query);
      res.send(cursor);
    })

    

    //about section
    app.get('/about', async (req, res) => {
      const result = await aboutCollection.find().toArray();
      res.send(result);
    });

    //package section
    app.get('/packages', async (req, res) => {
      const result = await packageCollection.find().toArray();
      res.send(result);
    });

    //asset section
    app.get('/assets', async (req, res) => {
      let query = {};
      // console.log(req.query)
      if (req?.query?.email) {
        query = { email: req.query.email }
      }
      // console.log(query)
      const cursor = assetCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })



////////////////////////////////////////
    app.get('/assets/quantity', async (req, res) => {
      let query = {};
      // console.log(req.query)
      if (req?.query?.email) {
        query = { email: req.query.email }
      }
      // console.log(query)
      const cursor = assetCollection.find({
        ...query,
        productQuantity: { $lt: 10 } 
      }).limit(4);
      const result = await cursor.toArray();
      res.send(result);
    })
    app.patch('/assets/:id', async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      // console.log(item, id)
      const updatedDoc = {
        $set: {
          productQuantity: item.productQuantity,
        }
      }
      // console.log(filter)
      const result = await assetCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })


    app.post('/assets', async (req, res) => {
      const asset = req.body;
      // console.log(asset)
      const result = await assetCollection.insertOne(asset)
      res.send(result)
    })

    //custom request list section
    app.get('/custom', async (req, res) => {
      const cursor = customCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/custom', async (req, res) => {
      const asset = req.body;
      // console.log(asset)
      const result = await customCollection.insertOne(asset)
      res.send(result)
    })
    // request section
    app.get('/requests', async (req, res) => {
      const cursor = requestCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/requests/pendingData', async (req, res) => {
      
      const cursor = requestCollection.find({
        status: "Pending"
      }).limit(5);
      const result = await cursor.toArray();
      res.send(result);
    })

    
    
    app.get('/requests/v4', async (req, res) => {
      let query = {}
      if (req?.query?.requesterEmail) {
        query = { requesterEmail: req.query.requesterEmail}
      }
      const cursor = requestCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    // app.get('/requests/v1', async (req, res) => {
    //   let query = {};
    //   // console.log(req.query)
    //   if (req?.query?.email) {
    //     query = { email: req.query.email }
    //   }
    //   // console.log(query)
    //   const cursor = requestCollection.find(query);
    //   const result = await cursor.toArray();
    //   // console.log(result)
    //   res.send(result);
    // })
    app.patch('/requests/:id', async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      // console.log(item, id)
      const updatedDoc = {
        $set: {
          status: item.status,
          approvalDate: item.approvalDate
        }
      }
      // console.log(filter)
      const result = await requestCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    app.post('/requests', async (req, res) => {
      const requestAsset = req.body;
      // console.log(asset)
      const result = await requestCollection.insertOne(requestAsset)
      res.send(result)
    })

    // Team Section
    // app.post('/teams', async (req, res) => {
    //   const user = req.body;
    //   //user do not exists
    //   let query = {};
    //   console.log(req.query)
    //   if (req?.query?.email) {
    //     query = { email: req.query.email }
    //   }
    //   const existingUser = await teamCollection.findOne(query);
    //   if (existingUser) {
    //     return res.send({ message: 'user already exists', insertedId: null })
    //   }
    //   // console.log(query)
    //   const result = await userCollection.insertOne(user);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})