import * as orderService from '../services/orderService.js';

export const getAll = async (req, res) => {
    const orders = await orderService.fetchAllOrders();
    res.status(200).json({ success: true, orders });
}

export const getMine = async (req, res) => {
    try {
        const user = req.session?.user;
        if (!user) {
            return res.status(401).json({ error: 'Please log in.' });
        }
        const orders = user.role === 'r'
            ? await orderService.fetchOrdersByRider(user.riderId)
            : await orderService.fetchOrdersByUser(user.id);
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

export const accept = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await orderService.acceptOrder(parseInt(id));
        res.status(200).json({
            success: true,
            message: result
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
}

export const decline = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const result = await orderService.declineOrder(parseInt(id), reason);
        res.status(200).json({
            success: true,
            message: result
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
}

export const assign = async (req, res) => {
    const { id } = req.params;
    const { rider_id } = req.body;

    try {
        const result = await orderService.assignRider(parseInt(id), parseInt(rider_id));
        res.status(200).json({
            success: true,
            message: result
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
}

export const uploadProof = async (req, res) => {
    const { id } = req.params;
    const { proof_image } = req.body;

    try {
        const result = await orderService.uploadProof(parseInt(id), proof_image);
        res.status(200).json({
            success: true,
            message: result
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
}

export const deliver = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await orderService.markDelivered(parseInt(id));
        res.status(200).json({
            success: true,
            message: result
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
}