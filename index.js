const cors = require('cors');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://cardb:jbW7mSX04G1JqBnw@cluster0.0g2vq.mongodb.net/cardb';
const client = new MongoClient(uri, {
});

async function run() {
  try {
    await client.connect();
    const database = client.db('cardb');
    const carCollection=database.collection('collections')
    const ordersCollection=client.db('cardb').collection('order')
    const reviewCollection=client.db('cardb').collection('review')
    const userCollection=client.db('cardb').collection('user')
    console.log("Connected to MongoDB!");

    app.get('/allOrder', async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });

    app.post('/placeorder',async(req,res)=>{
        const result= await ordersCollection.insertOne(req.body)
        res.send(result)
    })

    app.post('/addUserInfo',async(req,res)=>{
      const result=await userCollection.insertOne(req.body)
      res.send(result) 
    })

    app.put('/makeAdmin', async (req, res) => {
      try {
        const requestingUser = await userCollection.findOne({ email: req.body.requesterEmail });
        if (!requestingUser || requestingUser.role !== 'admin') {
          return res.status(403).json({ error: 'Unauthorized: Only admin users can perform this action' });
        }
    
        const filter = { email: req.body.email };
        const user = await userCollection.findOne(filter);
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        const result = await userCollection.updateOne(filter, { $set: { role: 'admin' } });
    
        res.json({ message: 'User role updated to admin' });
      } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'An error occurred while updating user role' });
      }
    });
    


    app.put("/statusUpdate/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const result = await ordersCollection.updateOne(filter, {
        $set: {
          status: req.body.status,
        },
      });
      res.send(result);      
   });

    app.get('/getReview',async(req,res)=>{
        const result=await reviewCollection.find({}).toArray()
        res.send(result)
    })

    app.delete('/deleteOrderAdmin/:id',async(req,res)=>{
      const result=await carCollection.deleteOne({
        _id:ObjectId(req.params.id)
      })
     res.send(result)
    })

    app.get('/checkAdmin/:email', async (req, res) => {
      try {
        const email = req.params.email;  
        const user = await userCollection.findOne({ email });  
        if (user && user.role === 'admin') {
          res.json({ isAdmin: true });
        } else {
          res.json({ isAdmin: false });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ error: 'An error occurred while checking admin status' });
      }
    });

   app.delete('/deleteOrder/:id',async(req,res)=>{
      const result=await ordersCollection.deleteOne({
        _id:new ObjectId(req.params.id)
      })
     res.send(result)
    })
    
    app.post('/addReview',async(req,res)=>{
        const result= await reviewCollection.insertOne(req.body)
        res.send(result)
    })

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });

  } finally {
    //await client.close();
  }
}

run().catch(console.error);
