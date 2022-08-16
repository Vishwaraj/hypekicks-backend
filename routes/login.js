import express from 'express';
import {client} from '../index.js';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
dotenv.config();
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import cors from 'cors';


const router = express.Router();



router.use(cors());

//function to check user already exists -->
const checkUserExists = async (username) => {
    const userName = username;
  
    const result = await client.db("hypekicks-db").collection("users").findOne({userName: userName})
    return result
  }


//function to login user -->  
router.post('/', async function(request, response) {

    //getting username and password
    const {username, password} = request.body;
    const user = request.body;


    //checking user exists
    const checkUser = await checkUserExists(username)


    //conditional code for further process
    if(!checkUser) {
        response.send({msg: 'Invalid Credentials'})
    } else {
        const storedPassword = checkUser.password;

        const isPasswordMatch = await bcrypt.compare(password, storedPassword);

        if(isPasswordMatch) {

            //creating token
            var token = jwt.sign({id : checkUser._id}, process.env.SECRET_KEY);

            response.send({message: 'Succesful login', user: request.body, token: token})
        } else {
            response.status(400).send({message: 'Invalid Credentials'})
        }

    }

})


export const loginRouter = router;