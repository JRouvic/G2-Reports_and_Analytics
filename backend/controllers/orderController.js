import * as orderService from '../services/orderService.js';

export const getMine = async (req, res) => {
    try {
        const user = req.session?.user;
        if (!user) {
            return res.status(401).json({ error: 'Please log in.' });
        }
        const orders = await orderService.fetchOrdersByUser(user.id);
        res.status(200).json({
            success: true,
            orders
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
}

export const place = async (req, res) => {
    try {
        const user = req.session?.user;
        if (!user) {
            return res.status(401).json({ error: 'Please log in to place an order.' });
        }
        const id = await orderService.placeOrder(user.id, user.name, req.body);
        res.status(200).json({
            success: true,
            message: id
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
}