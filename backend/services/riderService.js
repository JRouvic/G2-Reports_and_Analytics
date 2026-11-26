
import * as riderModel from '../models/riderModel.js';
import * as userModel  from '../models/userModel.js';
import validator       from 'validator';
import bcrypt          from 'bcryptjs';

const doesRiderExist = async (id) => {
    const existing = await riderModel.findRiderById(id);
    if (existing.length > 0) {
        return { result: true, rider: existing[0] };
    }
    return { result: false, rider: undefined };
}

const isBusy = async (riderId) => {
    const all = await riderModel.fetch();
    const rider = all.find(r => r.id === riderId);
    if (!rider) return false;
   
    return false; 
}

// get all
export const fetchAllRiders = async () => {
    const riders = await riderModel.fetch();
    return riders;
}

export const fetchFreeRiders = async () => {
    const riders = await riderModel.fetch();
    return riders.filter(r => r.status === 'Active' && !r.currentOrder);
}

// insert
export const createRider = async (rider) => {
    if (!rider.first_name || !rider.last_name) {
        throw new Error('First name and last name are required.');
    }

    if (!validator.isEmail(rider.email || '')) {
        throw new Error('Enter a valid email.');
    }

    if (!rider.mobile) {
        throw new Error('Mobile number is required.');
    }

    if (!rider.password || rider.password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
    }

    const existingUser = await userModel.findUserByEmail(rider.email.toLowerCase());
    if (existingUser.length) {
        throw new Error('This email is already in use.');
    }

    const hash   = bcrypt.hashSync(rider.password, bcrypt.genSaltSync(10));
    const userId = await userModel.insert({
        first_name: rider.first_name.trim(),
        last_name:  rider.last_name.trim(),
        email:      rider.email.toLowerCase(),
        password:   hash,
        role:       'r',
    });

    const riderId = await riderModel.insert({ userId, mobile: rider.mobile });
    return riderId;
}

// update
export const updateRider = async (rider) => {
    if (!rider.first_name || !rider.last_name) {
        throw new Error('First name and last name are required.');
    }

    if (!rider.mobile) {
        throw new Error('Mobile number is required.');
    }

    if (!validator.isEmail(rider.email || '')) {
        throw new Error('Enter a valid email.');
    }

    const existing = await doesRiderExist(rider.id);
    if (!existing.result) {
        throw new Error('Rider does not exist.');
    }

    const emailCheck = await userModel.findUserByEmail(rider.email.toLowerCase());
    if (emailCheck.length && emailCheck[0].id !== existing.rider.user_id) {
        throw new Error('This email is already in use.');
    }

    await userModel.update({
        id:         existing.rider.user_id,
        first_name: rider.first_name.trim(),
        last_name:  rider.last_name.trim(),
        email:      rider.email.toLowerCase(),
    });

    if (rider.password && rider.password.length >= 6) {
        const hash = bcrypt.hashSync(rider.password, bcrypt.genSaltSync(10));
        await userModel.updatePassword(existing.rider.user_id, hash);
    }

    await riderModel.update({
        id:     rider.id,
        mobile: rider.mobile,
        status: existing.rider.status,
    });

    return 'Rider updated.';
}

// resign
export const resignRider = async (id) => {
    const existing = await doesRiderExist(id);
    if (!existing.result) {
        throw new Error('Rider does not exist.');
    }

    await riderModel.remove(id);
    return 'Rider resigned.';
}

// reactivate
export const reactivateRider = async (id) => {
    const existing = await doesRiderExist(id);
    if (!existing.result) {
        throw new Error('Rider does not exist.');
    }

    await riderModel.update({
        id:     id,
        mobile: existing.rider.mobile,
        status: 'Active',
    });

    return 'Rider reactivated.';
}