const cors=require('cors')
const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId
require('dotenv').config()
const dotenv = require("dotenv");


const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

const uri = process.env.MONGO_URL
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0g2vq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
  try {
    await client.connect();
    const database=client.db('cardb')
    const carCollection=database.collection('collections')
    const ordersCollection=client.db('cardb').collection('order')
    const reviewCollection=client.db('cardb').collection('review')
    const userCollection=client.db('cardb').collection('user')
  //get


  app.post('/addproduct',async(req,res)=>{
    const service=req.body
    console.log('hit post',service);
   const result= await carCollection.insertOne(service)
    console.log(result);
   res.json(result)
 })

//placeorder
 app.post('/placeorder',async(req,res)=>{
  const result= await ordersCollection.insertOne(req.body)
  res.send(result)
 })

 app.post('/addUserInfo',async(req,res)=>{
  
   const result=await userCollection.insertOne(req.body)
   res.send(result)
  
 })

    app.get('/addproduct',async(req,res)=>{
      const cursor=carCollection.find({})
      const services = await cursor.toArray()
      res.send(services)
   })

   app.get('/myOrder/:email',async(req,res)=>{
    const result=await ordersCollection
    .find({email:req.params.email})
    .toArray()
    res.send(result)
 })
   //addproduct
   app.get('/addproduct/:id',async(req,res)=>{
     console.log(req.params.id)
     const result=await carCollection.find({_id:ObjectId(req.params.id)}).toArray()
    res.send(result[0]);
    // const query={_id:ObjectId(id)}
    // const service=await carCollection.findOne(query)
    // res.json(service)
 })


 app.get('/checkAdmin/:email',async(req,res)=>{
 const result=await userCollection.find({email:req.params.email}).toArray()
 res.send(result)
 console.log(result);
})

//allOrder
app.get('/allOrder',async(req,res)=>{
  const result=await ordersCollection.find({}).toArray()
  res.send(result)
 })

// deleteOrder
app.delete('/deleteOrder/:id',async(req,res)=>{
  const result=await ordersCollection.deleteOne({
    _id:ObjectId(req.params.id)
  })
 res.send(result)
 })
 // deleteOrder
app.delete('/deleteOrderAdmin/:id',async(req,res)=>{
  const result=await carCollection.deleteOne({
    _id:ObjectId(req.params.id)
  })
 res.send(result)
 })

  
 //makeAdmin

 app.put('/makeAdmin',async(req,res)=>{
  const filter={email:req.body.email}
  const result= await userCollection.find(filter).toArray()
  if(result){
    const documents= await userCollection.updateOne(filter,{
      $set:{role:"admin"}
    })
    console.log(documents);
  }
  console.log(result);
  
})
app.put("/statusUpdate/:id", async (req, res) => {
   const filter = { _id: ObjectId(req.params.id) };
   const result = await ordersCollection.updateOne(filter, {
     $set: {
       status: req.body.status,
     },
   });
   res.send(result);
   
});

 
//addReview
app.post('/addReview',async(req,res)=>{
  const result= await reviewCollection.insertOne(req.body)
  res.send(result)
 })

 app.get('/getReview',async(req,res)=>{
  const result=await reviewCollection.find({}).toArray()
  res.send(result)
 })
  
   
  
    

  }

  
  finally{
    //await client.close()
  }
}
run().catch(console.dir);


// app.get('/', (req, res) => {
//   res.send('Hello final')
// })


// app.listen(process.env.PORT || port)
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})