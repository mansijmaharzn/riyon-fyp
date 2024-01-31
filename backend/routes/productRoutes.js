import express from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';

const productRouter = express.Router();

// TODO: image for products

productRouter.get('/', async (req, res) => {
    const products = await Product.find();
    res.send(products);
});


productRouter.post(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const newProduct = new Product({
            name: req.body.name,
            url: (req.body.name.replace(/\s+/g, '-') + Date.now()).toLowerCase(),
            description: req.body.description,
            category: req.body.category,
            artist: req.body.artist,
            size: req.body.size,
            image: req.body.image,
            price: req.body.price,
            stock: req.body.stock,
            rating: 0,
            reviews: 0,
        });

        const product = await newProduct.save();
        res.send({ message: 'Product Created', product });
    })
);


productRouter.get(
    '/categories',
    expressAsyncHandler(async (req, res) => {
        const categories = await Product.find().distinct('category');
        res.send(categories);
    })
);


productRouter.get(
    '/artists',
    expressAsyncHandler(async (req, res) => {
        const artists = await Product.find().distinct('artist');
        res.send(artists);
    })
);


const PAGE_SIZE = 8;
productRouter.get(
    '/search',
    expressAsyncHandler(async (req, res) => {
        try {
            const { query } = req;
            const pageSize = query.pageSize || PAGE_SIZE;
            const page = query.page || 1;
            const category = query.category || '';
            const artist = query.artist || '';
            const price = query.price || '';
            const rating = query.rating || '';
            const order = query.order || '';
            const size = query.size || '';
            const searchQuery = query.query || '';

            const queryFilter =
                searchQuery && searchQuery !== 'all'
                    ? {
                        name: {
                            $regex: searchQuery,
                            $options: 'i', // case insensitive
                        },
                    }
                    : {};

            const categoryFilter = category && category !== 'all' ? { category } : {};
            const artistFilter = artist && artist !== 'all' ? { artist } : {};

            const ratingFilter =
                rating && rating !== 'all'
                    ? {
                        rating: {
                            $gte: Number(rating),
                        },
                    }
                    : {};

            const priceFilter =
                price && price !== 'all'
                    ? {
                        // 1-50
                        price: {
                            $gte: Number(price.split('-')[0]),
                            $lte: Number(price.split('-')[1]),
                        },
                    }
                    : {};

            const sizeFilter = size && size !== 'all' ? { size } : {}

            const sortOrder =
                order === 'featured'
                    ? { featured: -1 }
                    : order === 'lowest'
                        ? { price: 1 }
                        : order === 'highest'
                            ? { price: -1 }
                            : order === 'toprated'
                                ? { rating: -1 }
                                : order === 'newest'
                                    ? { createdAt: -1 }
                                    : { _id: -1 };

            const products = await Product.find({
                ...queryFilter,
                ...categoryFilter,
                ...artistFilter,
                ...priceFilter,
                ...ratingFilter,
                ...sizeFilter,
            })
                .sort(sortOrder)
                .skip(pageSize * (page - 1))
                .limit(pageSize);

            const countProducts = await Product.countDocuments({
                ...queryFilter,
                ...categoryFilter,
                ...artistFilter,
                ...priceFilter,
                ...ratingFilter,
                ...sizeFilter,
            });

            res.send({
                products,
                countProducts,
                page,
                total_pages: Math.ceil(countProducts / pageSize),
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    })
);

productRouter.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
});


// :url is the product url user requested
productRouter.get('/url/:url', async (req, res) => {
    const product = await Product.findOne({ url: req.params.url });
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
});



export default productRouter;