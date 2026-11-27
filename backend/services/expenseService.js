import * as expenseModel from '../models/expenseModel.js';

const doesExpenseExist = async (id) => {
    const all = await expenseModel.fetch();
    const existing = all.filter(e => e.id == id);
    if (existing.length > 0) {
        return { result: true, expense: existing[0] };
    }
    return { result: false, expense: undefined };
}

// get all
export const fetchAllExpenses = async () => {
    const expenses = await expenseModel.fetch();
    return expenses;
}

// insert
export const createExpense = async (expense) => {
    if (!expense.description || !expense.description.trim()) {
        throw new Error('Description is required.');
    }

    if (!(Number(expense.amount) > 0)) {
        throw new Error('Amount must be greater than 0.');
    }

    if (!expense.expense_date) {
        throw new Error('Date is required.');
    }

    const id = await expenseModel.insert({
        description:  expense.description.trim(),
        amount:       Number(expense.amount),
        expenseDate:  expense.expense_date,
    });

    return id;
}

// delete
export const deleteExpense = async (id) => {
    const existing = await doesExpenseExist(id);
    if (!existing.result) {
        throw new Error('Expense does not exist.');
    }

    await expenseModel.remove(id);
    return 'Expense deleted.';
}