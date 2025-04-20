const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all transactions for authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

// Add new transaction
router.post('/', auth, async (req, res) => {
    try {
        console.log('Transaction POST route: req.user:', req.user);
        console.log('Transaction POST route: req.user._id:', req.user ? req.user._id : null);

        const { type, category, amount, description, date } = req.body;

        // Validate required fields
        if (!type || !category || !amount) {
            return res.status(400).json({ error: 'Type, category and amount are required' });
        }

        // Validate transaction type
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Create transaction object
        const transaction = new Transaction({
            user: req.user._id,
            type,
            category,
            amount,
            description: description || '',
            date: date ? new Date(date) : new Date()
        });

        // Save transaction to database
        const savedTransaction = await transaction.save();

        // Update user's balance
        if (type === 'income') {
            req.user.balance += amount;
        } else {
            req.user.balance -= amount;
        }
        await req.user.save();

        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

// Export router
module.exports = router;
