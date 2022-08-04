import express, { response } from 'express';
import {MongoClient, ObjectId} from 'mongodb';
import cors from "cors";
import bcrypt from "bcrypt";



const app = express();
app.use(express.json());
app.use(cors());

const PORT = 4000;


//server setup code
app.listen(PORT, function(request, response)  {
  console.log('Server is running on', PORT);
})

//mongo db connection code
const MONGO_URL = "mongodb+srv://vishwaraj-admin:9637774387@cluster0.92hrg4g.mongodb.net";

async function createConnection() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log('MongoDB is connected');
    return client;
}

export const client = await createConnection();




//trial code
app.get('/', function(request, response) {
    response.send('Hello World!')
})

//adding the data code
app.post('/', async function(request, response) {
    const data = await request.body;

    const status = await client.db("hypekicks-db").collection("sneakers").insertMany(data)

    response.send(status);
    console.log(status);

});


//route to get all sneakers
app.get('/home', async function(request, response) {

    
    const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();
    response.send(result);


});


//route to get new releases 

app.get('/home/new-releases', async function(request, response) {
   
  const result = await client.db("hypekicks-db").collection("sneakers").find({
    category: 'new-releases'
  }).toArray();
  response.send(result);

})


//route to get popular
app.get('/home/popular', async function(request, response) {
    const result = await client.db("hypekicks-db").collection("sneakers").find({
        category: 'popular'
    }).toArray();
    response.send(result);
    
})

//route to get trending 

app.get('/home/trending', async function(request, response) {
    const result = await client.db("hypekicks-db").collection("sneakers").find({
        category: 'trending'
    }).toArray();
    response.send(result);
})

app.get('/home/all', async function(request, response) {
    const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();
    response.send(result);
})


//route for single product
app.get('/home/single-product/:productID', async function(request, response) {
    
    const productID = request.params.productID;

   const result = await client.db("hypekicks-db").collection("sneakers").findOne({
    _id: ObjectId(productID)
   })
   const type = result.category;

   console.log(type);
   const relatedProducts = await client.db("hypekicks-db").collection("sneakers").find({category: type}).limit(4).toArray();

   

   response.send({result, relatedProducts});

}) 


//check product already in cart --
const checkProductCart = async (id) => {
    let result = await client.db("hypekicks-db").collection("cart").findOne({_id: ObjectId(id)})
    
    return result
}


//add to cart -
app.post('/home/single-product/:productID', async function(request, response)  {

   const product = request.body;
   request.body._id = ObjectId(request.body._id);
   const check = await checkProductCart(product._id)
   console.log(request.body)

   if(!check) {
      const result = await client.db("hypekicks-db").collection("cart").insertOne(product);
      response.send(result);
   } else {
      response.send({message: 'Product already in cart'})
   }

})


//CART ROUTE

app.get('/cart', async function(request, response) {
    const result = await client.db("hypekicks-db").collection("cart").find({}).toArray();
    response.send(result);
})


//remove product from cart-
app.delete('/cart', async function(request, response) {
    const id = request.body.id;
    
    const result = await client.db("hypekicks-db").collection("cart").deleteOne({_id: ObjectId(id)})

    response.send(result);
    console.log(result);

})


//----------------------------------USER DASHBOARD CODE ------------------------------------------------

app.put('/profile-page/addresses', async function(request, response) {
    const address = request.body;
    const userName = request.headers.username;
    
    const findUser = await client.db("hypekicks-db").collection("users")
                .updateOne({userName: userName}, {$set: {address: address}})
                      
    console.log(findUser);
    response.send(findUser);
    


})






//-----------------------------AUTHORIZATION & AUTHENTICATION CODE---------------------------- ---

//auth code

const genHashPassword = async (password) => {
   const NO_OF_ROUNDS = 10
   const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
   const hashedPassword = await bcrypt.hash(password, salt);
   return hashedPassword
}


const checkUserExists = async (username) => {
  const userName = username;

  const result = await client.db("hypekicks-db").collection("users").findOne({userName: userName})
  return result
}


//for login
app.post('/login', async function(request, response) {
    const {username, password} = request.body;
    const user = request.body;

    const checkUser = await checkUserExists(username)

    if(!checkUser) {
        response.send({msg: 'Invalid Credentials'})
    } else {
        const storedPassword = checkUser.password;

        const isPasswordMatch = await bcrypt.compare(password, storedPassword);

        if(isPasswordMatch) {
            response.send({message: 'Succesful login', user: request.body})
        } else {
            response.status(400).send({message: 'Invalid Credentials'})
        }

    }

})


//for signup
app.post('/signup', async function(request, response) {
    
    const user = await request.body;

    const checkUser = await checkUserExists(user.userName);

    const hashPassword = await genHashPassword(user.password);


    if(checkUser) {
        response.send({message:'User already exists! try a different name'})
    } else {
        const result = await client.db("hypekicks-db").collection("users").insertOne({
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: hashPassword
        })
        response.send(result);
    }
    
  

})