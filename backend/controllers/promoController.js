import * as promoService from '../services/promoService.js';

export const create = async (req, res) => {
    const { code, type, value, min_order, expires_on, usage_limit, once_per_user } = req.body;
    const promo = { code, type, value, min_order, expires_on, usage_limit, once_per_user };

    try {
        const result = await promoService.createPromo(promo);
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