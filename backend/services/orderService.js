import * as orderModel from '../models/orderModel.js';
import * as orderItemModel from '../models/orderItemModel.js';
import * as orderLogModel  from '../models/orderLogModel.js';
import * as itemModel from '../models/itemModel.js';
import * as promoModel from '../models/promoModel.js';

const today = () => new Date().toISOString().slice(0, 10);

const doesOrderExist = async (id) => {
    const existing = await orderModel.findOrderById(id);
    if (existing.length > 0) {
        return { result: true, order: existing[0] };
    }
    return { result: false, order: undefined };
};

const enrich = async (orders) => {
    if (!orders.length) return [];
    return Promise.all(orders.map(async (o) => ({
        ...o,
        items: await orderItemModel.findByOrderId(o.id),
        logs:  await orderLogModel.findByOrderId(o.id),
    })));
};

// get all
export const fetchAllOrders = async () => {
    const orders = await orderModel.fetch();
    return enrich(orders);
};

export const fetchOrdersByUser = async (userId) => {
    const orders = await orderModel.findOrdersByUser(userId);
    return enrich(orders);
};

// insert
export const placeOrder = async (userId, customerName, body) => {
    if (!body.address) {
        throw new Error('Delivery address is required.');
    }

    if (!body.want_date) {
        throw new Error('Preferred delivery date is required.');
    }

    if (!body.items || !body.items.length) {
        throw new Error('No items in cart.');
    }

    if (body.want_date < today()) {
        throw new Error('Choose today or a later date.');
    }

    let subtotal = 0;
    const enrichedItems = [];

    for (const { item_id, quantity } of body.items) {
        const existing = await itemModel.findItemById(item_id);

        if (!existing.length || existing[0].deleted) {
            throw new Error(`Item #${item_id} is not available.`);
        }

        if (!existing[0].available) {
            throw new Error(`"${existing[0].name}" is currently unavailable.`);
        }

        subtotal += Number(existing[0].price) * quantity;

        enrichedItems.push({
            itemId: item_id,
            quantity,
            price: Number(existing[0].price)
        });
    }

    const DELIVERY_FEES = {
        'Puting Bato East': 30,
        'Puting Bato West': 35,
        'Sinisian East': 30,
        'Dila': 45,
        'Caluangan': 50,
        'Sinisian West': 50,
        'Baclas': 60,
        'Coral ni Bacal': 60,
    };

    const barangayMatch = (body.address || '').match(/Barangay:\s*([^|]+)/);
    const barangay = barangayMatch ? barangayMatch[1].trim() : '';
    const fee = DELIVERY_FEES[barangay] ?? 20;
    const rushFee = body.is_rush ? 80 : 0;

    let disc = 0;
    let usedCode = null;

    // validate promo
    if (body.promo_code) {
        const promo = await promoModel.findPromoByCode(
            body.promo_code.toUpperCase()
        );

        if (!promo.length || !promo[0].enabled || promo[0].expires_on <= today()) {
            throw new Error('This promo code is invalid or has expired.');
        }

        if (promo[0].usage_limit && promo[0].used_count >= promo[0].usage_limit) {
            throw new Error('This promo code has reached its usage limit.');
        }

        if (subtotal < promo[0].min_order) {
            throw new Error(
                `Minimum order for this code is ₱${Number(promo[0].min_order).toFixed(2)}.`
            );
        }

        disc = Math.min(subtotal, Math.round(
            promo[0].type === '%'
                ? subtotal * promo[0].value / 100
                : promo[0].value
        ));

        usedCode = promo[0].code;
    }

    const total = subtotal - disc + fee + rushFee;

    const orderId = await orderModel.insert({
        userId,
        customerName,
        address: body.address,
        wantDate: body.want_date,
        isRush: body.is_rush ? 1 : 0,
        subtotal,
        discount: disc,
        promoCode: usedCode,
        deliveryFee: fee + rushFee,
        total,
    });

    await orderItemModel.insert({
        orderId,
        items: enrichedItems
    });
    await orderLogModel.insert({ 
        orderId, 
        note: 'Order placed by customer' });
    if (usedCode) await promoModel.incrementUsed(usedCode);

    return orderId;
};

// accept
export const acceptOrder = async (id) => {
    const existing = await doesOrderExist(id);

    if (!existing.result) {
        throw new Error('Order does not exist.');
    }

    if (existing.order.status !== 'Pending') {
        throw new Error('Only pending orders can be accepted.');
    }

    await orderModel.update({ id, status: 'Accepted' });
    await orderLogModel.insert({ orderId: id, note: 'Accepted by admin' });

    return 'Order accepted.';
};

// decline
export const declineOrder = async (id, reason) => {
    if (!reason || !reason.trim()) {
        throw new Error('Reason is required.');
    }

    const existing = await doesOrderExist(id);

    if (!existing.result) {
        throw new Error('Order does not exist.');
    }

    await orderModel.update({
        id,
        status: 'Declined',
        declineReason: reason.trim()
    });
    await orderLogModel.insert({ 
        orderId: id, 
        note: 'Declined by admin' });
    if (existing.order.promo_code) await promoModel.decrementUsed(existing.order.promo_code);

    return 'Order declined.';
};