import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Database Connection Successful!');
    })
    .catch((err) => {
        console.log(err.message);
    });


app.use('/api/users', userRouter);
app.use('/api/products', productRouter);


app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}!`))