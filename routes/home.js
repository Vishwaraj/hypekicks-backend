import express from 'express';
import {client} from '../index.js';
import {ObjectId} from 'mongodb';
const router = express.Router();
import {auth} from '../middleware/auth.js';



//function to send/get all sneakers -->
router.get('/', auth ,async function(request, response) {

    
    const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();
    response.send(result);


});



//function to get new releases category sneakers -->
router.get('/new-releases', auth ,async function(request, response) {
   
    const result = await client.db("hypekicks-db").collection("sneakers").find({
      category: 'new-releases'
    }).toArray();
    response.send(result);
  
  })
  
 
  
  //function to get popular category sneakers -->
  router.get('/popular', auth ,async function(request, response) {
      const result = await client.db("hypekicks-db").collection("sneakers").find({
          category: 'popular'
      }).toArray();
      response.send(result);
      
  })
  


  //function to get trending category sneakers -->
  router.get('/trending', auth ,async function(request, response) {
      const result = await client.db("hypekicks-db").collection("sneakers").find({
          category: 'trending'
      }).toArray();
      response.send(result);
  })
  


  //function to get all sneakers -->
  router.get('/all', auth ,async function(request, response) {
      const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();
      response.send(result);
  })
  
  
  //function for single product -->
  router.get('/single-product/:productID', auth ,async function(request, response) {
      
      const productID = request.params.productID;
  
     const result = await client.db("hypekicks-db").collection("sneakers").findOne({
      _id: ObjectId(productID)
     })
     const type = result.category;
  
     console.log(type);
     const relatedProducts = await client.db("hypekicks-db").collection("sneakers").find({category: type}).limit(4).toArray();
  
     
  
     response.send({result, relatedProducts});
  
  }) 
  
  
  //function to check product already in cart --
  const checkProductCart = async (id) => {
      let result = await client.db("hypekicks-db").collection("cart").findOne({_id: ObjectId(id)})
      
      return result
  }
  
  
  //function to add sneaker to cart -
  router.post('/single-product/:productID', auth ,async function(request, response)  {
  
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

  export const homeRouter = router;