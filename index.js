const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json()); 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hnkiytr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('Assignment12').collection('category');
        const allMobile = client.db('Assignment12').collection('allmobile');
        const usersCollection = client.db('Assignment12').collection('users');

        app.get('/category', async (req, res) => {
            let query = {};
            const cursor = serviceCollection.find(query);
            const serve = await cursor.toArray();
            res.send(serve);
        });


        //new
        app.post('/allmobile', async (req, res) => {
            const review = req.body;
            const result = await allMobile.insertOne(review);
            res.send(result);
        });
        app.get('/allmobile', async (req, res) => {
            let query = {};
            const cursor = allMobile.find(query);
            const serve = await cursor.toArray();
            res.send(serve);
        });

        app.get('/allmobile/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.get('/reviewss', async (req, res) => {
            let query = {};

            if (req.query.category) {
                query = {
                    category: req.query.category
                }
            }
            const cursor = allMobile.find(query).limit(0).sort({$natural:-1}) 
            const review = await cursor.toArray();
            res.send(review);
        });


        //jwt
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });


        //users
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'verified-seller'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });





    }

    finally{

    }
}
run().catch(err => console.error(err))




app.get('/', async(req, res)=>{
    res.send('A12 running')
})
app.listen(port, ()=>{
    console.log(`A12 running${port}`)
})