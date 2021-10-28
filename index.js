const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const {MongoClient} = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hw8wv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function run() {
  try {
    await client.connect();

    const database = client.db("carMechanic");

    const servicesCollection = database.collection("services");

    //get api
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    //get single service

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    //POST API

    app.post("/services", async (req, res) => {
      const service = req.body;

      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.json(result);
    });

    //update API

    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const updateService = req.body;
      const filter = {_id: ObjectId(id)};
      const options = {upsert: true};

      const updateServiceDoc = {
        $set: {
          name: updateService.name,
          description: updateService.description,
          price: updateService.price,
          img: updateService.img
        }
      };
      const result = await servicesCollection.updateOne(
        filter,
        updateServiceDoc,
        options
      );
      console.log("service updated", req);
      res.json(result);
    });

    //delete api

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", function (req, res) {
  res.send("running");
});

app.listen(port, () => {
  console.log("server running", port);
});
