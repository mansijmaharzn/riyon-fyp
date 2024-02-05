// Orders database from DB
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    // Accepts objest as parameter that defines the fields of products
    {
        // list of ordered items
        orderItems: [
            {
                url: { type: String, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
            },
        ],
        // other details
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            pinCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentResult: {
            id: String,
            paymentMethod: String,
            status: String,
            update_time: { type: Date },
        },
        itemsPrice: { type: Number, required: true },
        shippingPrice: { type: Number, required: true },
        taxPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
    },
    // Accepts options
    {
        timestamps: true, // for logging timestamp for create and update of records
    }
);

// creating model for schema
const Order = mongoose.model('Order', orderSchema);

export default Order;
