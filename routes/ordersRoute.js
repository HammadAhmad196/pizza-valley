const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const stripe = require("stripe")("sk_test_w2uVqXex1U67SYY8f6hKmBEO00ikrLqnnV")
const Order = require('../models/OrderModal');

router.post("/placeOrder", async (req, res) => {

    const { token, subtotal, currentUser, cartItems } = req.body

    try {
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        })

        const payment = await stripe.charges.create({
            amount: subtotal * 100,
            currency: 'inr',
            customer: customer.id,
            receipt_email: token.email
        }, {
            idempotencyKey: uuidv4()
        })

        if (payment) {

            const newOrder = new Order({
                name: currentUser.name,
                email: currentUser.email,
                userid: currentUser._id,
                orderItems: cartItems,
                orderAmount: subtotal,
                shippingAddress: {
                    street: token.card.address_line1,
                    city: token.card.address_city,
                    country: token.card.address_country,
                    pincode: token.card.address_zip,
                },
                transactionId: payment.source.id
            })

            newOrder.save()

            res.send('Order Place Successfully')
        }
        else {
            res.send('Order Place Failed')
        }

    } catch (error) {
        return res.status(400).json({ message: 'Something went wrong' + error });
    }

});

router.post("/getuserorders", async (req, res) => {
    const { userid } = req.body
    try {
        const orders = await Order.find({ userid: userid }).sort({ _id: -1 })
        res.send(orders)
    } catch (error) {
        return res.status(400).json({ message: 'Something went wrong' });
    }
})



router.get("/getallorders", async (req, res) => {

    try {
        const orders = await Order.find({})
        res.send(orders)
    } catch (error) {
        return res.status(400).json({ message: error })
    }


    router.post("/deliverorder", async (req, res) => {

        const orderid = req.body.orderid
        try {
            const order = await Order.findOne({ _id: orderid })
            order.isDelivered = true
            await order.save()
            res.send('Order deliver successfully')
        } catch (error) {
            return res.status(400).json({ message: "Something went wrong" })
        }

    });
    

    router.post('/deleteorder', async (req, res) => {

        const orderid = req.body.orderid

        try {
            await Order.findOneAndDelete({ _id: orderid })
            res.send('Order Deleted Successfully')
        } catch (error) {
            return res.status(400).json({ message: error })
        }
    })
})

module.exports = router