import express from 'express';
import {client} from '../index.js';
import {ObjectId} from 'mongodb';
const router = express.Router();
import {auth} from '../middleware/auth.js';



//function to send/get all sneakers -->
router.get('/', auth ,async function(request, response) {
    const sort = request.header("sort-price");
      
    const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();

    if(sort === '') {
        response.send(result);
    } else if (sort === 'low-to-high') {
        result.sort((a,b) => b.price - a.price)
        response.send(result)
    } else if (sort === 'high-to-low') {
        result.sort((a,b) => a.price - b.price)
        response.send(result)
    }

});


//route to get sneakers with ratings
router.post('/rating', async function (request, response) {
    const rating = Number(request.body.rating);
    console.log(rating);
    const result = await client.db("hypekicks-db").collection("sneakers").find({}).toArray();
    
        if(rating < 3) {
          response.status(200).send(result);
        } else {
            try {
            
                const ratedArr = await result.filter((product) => {
                     return product.rating === rating
                })
                response.status(200).send(ratedArr);
            } catch (error) {
                response.status(400).send(error);
            }
        }

})


//function to get new releases category sneakers -->
router.get('/new-releases', auth ,async function(request, response) {
   
    const result = await client.db("hypekicks-db").collection("sneakers").find({
      category: 'new releases'
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
  const checkProductCart = async (productName, user) => {
      let result = await client.db("hypekicks-db").collection("cart").findOne({  
    $and: [
        {name: productName},
        {user: user}
    ]    
    })
      
      return result
  }
  
  
  //function to add sneaker to cart -
  router.post('/single-product/:productID', auth ,async function(request, response)  {
  
     const product = request.body;
     request.body._id = ObjectId(request.body._id);
     const check = await checkProductCart(product.name, product.user)
     console.log(request.body)
  
     const insertedProduct = {
        name: product.name,
        image: product.image,
        description: product.description,
        category: product.category,
        price: product.price,
        size: product.size,
        quantity: product.quantity,
        user: product.user
     }

     if(!check) {
        const result = await client.db("hypekicks-db").collection("cart").insertOne(insertedProduct);
        response.send(result);
     } else {
        response.send({message: 'Product already in cart'})
     }
  
  })

  export const homeRouter = router;
