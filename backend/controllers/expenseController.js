import * as expenseService from '../services/expenseService.js';

export const getAll = async (req, res) => {
    const expenses = await expenseService.fetchAllExpenses();
    res.status(200).json({ success: true, expenses });
}

export const create = async (req, res) => {
    const { description, amount, expense_date } = req.body;
    const expense = { description, amount, expense_date };

    try {
        const id = await expenseService.createExpense(expense);
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

export const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await expenseService.deleteExpense(parseInt(id));
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