const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors({
  origin:['https://foddy-resturent-project.netlify.app/'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uzun1bo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


// middlewares
const logger = async (req, res, next) => {
  console.log('called:', req.host, req.originalUrl)
  next();
}

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
      return res.status(401).send({ message: 'Your access unauthorized ' })
  }
  jwt.verify(token, secret, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: ' Your access unauthorized ' })
      }
      req.user = decoded;
      console.log("decoded-data",decoded);
      next();
  })
}




async function run() {
  try {
    

    const database = client.db("fooddata").collection("allfoods");
    const orderdatabase = client.db("fooddata").collection("order");
    const userdatabase = client.db("fooddata").collection("userdata");

    app.get("/allfoods", async (req, res) => {
      let query = {};
      const name = req.query.foodName;
      if (name) {
        query.foodName = name;
      }

      const page = parseInt(req.query.page);
      const limit = 9;
      const skip = page * limit;

      const result = await database
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ order: "desc" })
        .toArray();
      const total = await database.countDocuments();
      res.send({ result, total });
    });

    app.get("/foods/:_id", async (req, res) => {
      const id = req.params._id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await database.findOne(query);
      res.send(result);
    });
    //get updated singledata
    app.get("/addedfood/:_id", async (req, res) => {
      const id = req.params._id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await database.findOne(query);
      res.send(result);
    });

    //updated Add Food
    app.put("/addedfood/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("id", id, data);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedata = {
        $set: {
          foodName: data.foodName,
          foodImage: data.foodImage,
          foodCategory: data.foodCategory,
          order: data.order,
          price: data.price,
          country: data.country,
          description: data.description,
        },
      };
      const result = await database.updateOne(filter, updatedata, options);
      res.send(result);
    });

    //add food data

    app.post("/allfoods", async  (req, res) => {
      const order = req.body;
      const result = await database.insertOne(order);
      console.log(result);
      res.send(result);
    });

    //add mongodb user data

    app.post("/user", async (req, res) => {
      const userdata = req.body;
      const result = await userdatabase.insertMany(userdata);
      console.log(result);
      res.send(result);
    });

       //jwt post
       app.post("/jwt",async(req,res)=>{
        const user=req.body;
        console.log('access-token',user);
    const token= jwt.sign(user,secret,{ expiresIn: '10h' })
  
    res.cookie("token",token,{
      httpOnly:true,
      secure:true,
      sameSite:"none"
  
    })
    .send({success:true})
    })
  

    //get user data
    app.get("/user",logger,verifyToken, async (req, res) => {
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
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
