const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all transactions for a user
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

// Add new transaction
router.post('/', auth, async (req, res) => {
    try {
        const { type, category, amount, description, date } = req.body;
        
        if (!type || !category || !amount) {
            return res.status(400).json({ error: 'Type, category and amount are required' });
        }
        
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }
        
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const transaction = new Transaction({
            user: req.user._id,
            type,
            category,
            amount,
            description: description || '',
            date: date ? new Date(date) : new Date()
        });

        await transaction.save();
        
        // Update user's balance
        if (type === 'income') {
            req.user.balance += amount;
        } else {
            req.user.balance -= amount;
        }
        await req.user.save();

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

// Update transaction
router.patch('/:id', async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['description', 'amount', 'category', 'type', 'date'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        updates.forEach(update => transaction[update] = req.body[update]);
        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 