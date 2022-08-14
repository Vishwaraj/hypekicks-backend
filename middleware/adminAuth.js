import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const adminAuth = (request, response, next) => {
    try {
        const adminToken = request.header('admin-auth-token');
        jwt.verify(adminToken, process.env.SECRET_KEY);
        next();
    } catch (error) {
        console.log(error.message);
    }
}