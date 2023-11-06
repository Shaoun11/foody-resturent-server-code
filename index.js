const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;




app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uzun1bo.mongodb.net/?retryWrites=true&w=majority`;

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

    await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("fooddata").collection("allfoods")




    app.get("/allfoods", async (req, res) => {
     
        let query={}
         const name=req.query.foodName;
        if (name) {
            query.foodName=name
        }

        const page=parseInt(req.query.page);
        const limit=parseInt(req.query.limit);
        const skip=(page-1)*limit;

        const result = await database.find(query).skip(skip).limit(limit).sort({order:"desc"}). toArray();
        const total= await database.countDocuments();
        res.send({result,total});
      });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get("/", (req, res) => {
    res.send("Food Api...");
  });

  app.listen(port, () => {
    console.log(`Food server is Running on port ${port}`);
  });
    