
import * as riderService from '../services/riderService.js';

export const getAll = async (req, res) => {
    const riders = await riderService.fetchAllRiders();
    res.status(200).json({ success: true, riders });
}

export const getFree = async (req, res) => {
    const riders = await riderService.fetchFreeRiders();
    res.status(200).json({ success: true, riders });
}

export const create = async (req, res) => {
    const { first_name, last_name, email, mobile, password } = req.body;
    const rider = { first_name, last_name, email, mobile, password };

    try {
        const id = await riderService.createRider(rider);
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

export const update = async (req, res) => {
    const { first_name, last_name, email, mobile, password } = req.body;
    const { id } = req.params;
    const rider = { id: parseInt(id), first_name, last_name, email, mobile, password };

    try {
        const result = await riderService.updateRider(rider);
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

export const resign = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await riderService.resignRider(parseInt(id));
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

export const reactivate = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await riderService.reactivateRider(parseInt(id));
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
