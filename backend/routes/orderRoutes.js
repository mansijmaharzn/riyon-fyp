import express from 'express';
import { isAuth, isAdmin } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

const orderRouter = express.Router();


orderRouter.post(
    '/',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const newOrder = new Order({
            orderItems: req.body.orderItems.map((item) => ({
                ...item,
                // product: item.product,
            })),

            shippingAddress: req.body.shippingAddress,
            itemsPrice: req.body.itemsPrice,
            shippingPrice: req.body.shippingPrice,
            taxPrice: req.body.taxPrice,
            totalPrice: req.body.totalPrice,
            user: req.user,
        });

        const order = await newOrder.save();
        res.status(201).send({
            message: 'New Order Created',
            order: order.toObject({ getters: true }),
        });
    })
);


orderRouter.get(
    '/my-orders',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const orders = await Order.find({ user: req.user._id });
        res.send(orders);
    })
);


orderRouter.put(
    '/:id/payment',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            if (!order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: req.body.id,
                    paymentMethod: req.body.paymentMethod,
                    status: req.body.status,
                    update_time: new Date().toISOString(),
                };
                const updatedOrder = await order.save();
                res.send({ message: 'Order Paid Successfully', order: updatedOrder });
            } else {
                res.status(409).send({ message: 'Order Already Paid', order: order })
            }
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);


export default orderRouter;