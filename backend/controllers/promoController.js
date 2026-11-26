import * as promoService from '../services/promoService.js';

export const getAll = async (req, res) => {
    const promos = await promoService.fetchAllPromos();
    res.status(200).json({ success: true, promos });
}

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

export const toggle = async (req, res) => {
    const { code } = req.params;
    const { enabled } = req.body;

    try {
        const result = await promoService.togglePromo(code, enabled);
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

export const remove = async (req, res) => {
    const { code } = req.params;

    try {
        const result = await promoService.deletePromo(code);
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

export const validate = async (req, res) => {
    const { code, subtotal } = req.body;

    try {
        const p = await promoService.validatePromo(code, subtotal);
      const disc = Math.min(
           Number(subtotal),
           Math.round(p.type === '%' ? subtotal * p.value / 100 : p.value)
        );
        res.status(200).json({
            success:  true,
            discount: disc,
            promo:    p,
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            error: `${e.message || "Internal Server Error"}`
        });
    }
}