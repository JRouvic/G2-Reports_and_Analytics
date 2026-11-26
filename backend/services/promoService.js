import * as promoModel from '../models/promoModel.js';

const today = () => new Date().toISOString().slice(0, 10);

const doesPromoExist = async (code) => {
    const existing = await promoModel.findPromoByCode(code);
    if (existing.length > 0) {
        return { result: true, promo: existing[0] };
    }
    return { result: false, promo: undefined };
}

// insert
export const createPromo = async (promo) => {
    if (!promo.code || !promo.code.trim()) {
       throw new Error('Promo code is required.');
    }

   if (!(Number(promo.value) > 0)) {
        throw new Error('Value must be greater than 0.');
    }

    if (promo.type === '%' && Number(promo.value) > 100) {
        throw new Error('Percent cannot exceed 100.');
   }

    if (!promo.expires_on) {
        throw new Error('Expiry date is required.');
    }

    if (promo.expires_on <= today()) {
        throw new Error('Expiry date must be after today.');
    }

    const existing = await doesPromoExist(promo.code.trim().toUpperCase());
    if (existing.result) {
        throw new Error('This code already exists.');
    }

    await promoModel.insert({
        code:        promo.code.trim().toUpperCase(),
        type:        promo.type,
       value:       Number(promo.value),
        minOrder:    Number(promo.min_order) || 0,
        expiresOn:   promo.expires_on,
       usageLimit:  promo.usage_limit ? Number(promo.usage_limit) : null,
        oncePerUser: promo.once_per_user ? 1 : 0,
    });

    return 'Promo code created.';
}
