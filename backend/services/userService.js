import * as userModel  from '../models/userModel.js';
import * as riderModel from '../models/riderModel.js';
import validator from 'validator';
import bcrypt    from 'bcryptjs';

const doesUserExist = async (email) => {
    const existing = await userModel.findUserByEmail(email);
    if (existing.length > 0) {
        return { result: true, user: existing[0] };
    }
    return { result: false, user: undefined };
}

// get all
export const fetchAllUsers = async () => {
    const users = await userModel.fetch();
    return users;
}

// register
export const createAccount = async (user) => {
    const salt           = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    const id = await userModel.insert({
        first_name: user.first_name.trim(),
        last_name:  user.last_name.trim(),
        email:      user.email,
        password:   hashedPassword,
        role:       'c',
    });

    if (!id || id <= 0) {
        throw new Error('Unable to create account. Please try again later.');
    }

    return 'Account created successfully!';
}