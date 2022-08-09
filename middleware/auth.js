import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//custom middleware

export const auth = (request, response, next) => {

    try {
        const token = request.header('auth-token');
        jwt.verify(token, process.env.SECRET_KEY)
        next();
    } catch (error) {
        console.log(error.message);
    }

}