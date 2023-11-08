const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const database = client.db("fooddata").collection("allfoods");
    const orderdatabase = client.db("fooddata").collection("order");
    const userdatabase = client.db("fooddata").collection("userdata");


    app.get("/allfoods", async (req, res) => {
     
        let query={}
         const name=req.query.foodName;
        if (name) {
            query.foodName=name
        }

        const page=parseInt(req.query.page);
        const limit=9;
        const skip=(page)*limit;

        const result = await database.find(query).skip(skip).limit(limit).sort({order:"desc"}). toArray();
        const total= await database.countDocuments();
        res.send({result,total});
      });

      app.get("/foods/:_id",async(req,res)=>{
        const id=req.params._id;
        const query={
            _id:new ObjectId(id)
        }
        const result=await database.findOne(query);
        res.send(result);
      })


    //add food data

    app.post("/allfoods", async (req, res) => {
      const order = req.body;
      const result = await database.insertOne(order);
      console.log(result);
      res.send(result);
    });

    //add mongodb user data

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userdatabase.insertOne(user);
      console.log(result);
      res.send(result);
    });

    //get user data
    app.get("/user", async (req, res) => {
      const result = await userdatabase.find().toArray();
      res.send(result);
    });


    //get myadded data
    app.get("/addedfood", async (req, res) => {
      const result = await database.find().toArray();
      res.send(result);
    });

    //post data order
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderdatabase.insertOne(order);
      console.log(result);
      res.send(result);
    });

     //get order data
     app.get("/order", async (req, res) => {
      const result = await orderdatabase.find().toArray();
      res.send(result);
    });

    // //updated sell data
    // app.put("/foods/:_id", async (req, res) => {
    //   const id = req.params._id;
    //   const data = req.body;
    //   console.log("id", id, data);
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updatedata = {
    //     $set: {
    //       order:data.order
    //     },
        
    //   };
    //   const result = await database.updateOne(filter,updatedata,options);
    //   console.log(result);
    //   res.send(result);
     
    // });


     //delete  orderd data 
  app.delete("/order/:_id", async (req, res) => {
    const id = req.params._id;
    const query = {
      _id: new ObjectId(id),
    };
    const result = await orderdatabase.deleteOne(query);
    console.log(result);
    res.send(result);
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
    