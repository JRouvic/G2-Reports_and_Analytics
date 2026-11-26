import * as promoModel from '../models/promoModel.js';

const today = () => new Date().toISOString().slice(0, 10);

const doesPromoExist = async (code) => {
    const existing = await promoModel.findPromoByCode(code);
    if (existing.length > 0) {
        return { result: true, promo: existing[0] };
    }
    return { result: false, promo: undefined };
}


// get all
export const fetchAllPromos = async () => {
    const promos = await promoModel.fetch();
    return promos;
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

// toggle
export const togglePromo = async (code, enabled) => {
   const existing = await doesPromoExist(code);
    if (!existing.result) {
        throw new Error('Promo code does not exist.');
    }

    await promoModel.update({ code, enabled });
    return `Promo code ${enabled ? 'enabled' : 'disabled'}.`;
}

// delete
export const deletePromo = async (code) => {
    const existing = await doesPromoExist(code);
   if (!existing.result) {
        throw new Error('Promo code does not exist.');
    }

    await promoModel.remove(code);
    return 'Promo code deleted.';
}

// validate
export const validatePromo = async (code, subtotal) => {
    if (!code) {
        throw new Error('Promo code is required.');
    }

    const existing = await doesPromoExist(code.trim().toUpperCase());
    if (!existing.result) {
        throw new Error('This promo code is invalid or has expired.');
    }

    const p = existing.promo;
    if (!p.enabled || p.expires_on <= today()) {
        throw new Error('This promo code is invalid or has expired.');
    }

   if (p.usage_limit && p.used_count >= p.usage_limit) {
      throw new Error('This promo code has reached its usage limit.');
    }

    if (subtotal < p.min_order) {
        throw new Error(`Minimum order for this code is ₱${Number(p.min_order).toFixed(2)}.`);
    }

    return p;
}