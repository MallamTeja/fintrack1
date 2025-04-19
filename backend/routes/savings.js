const express = require('express');
const router = express.Router();
const { SavingsGoal } = require('../db');
const auth = require('../middleware/auth');

// Get all savings goals
router.get('/', auth, async (req, res) => {
    try {
        const goals = await SavingsGoal.find({ user_id: req.user._id })
            .sort({ due_date: 1 });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new savings goal
router.post('/', auth, async (req, res) => {
    try {
        const goal = new SavingsGoal({
            ...req.body,
            user_id: req.user._id
        });
        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update savings goal
router.patch('/:id', auth, async (req, res) => {
    try {
        const goal = await SavingsGoal.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json(goal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete savings goal
router.delete('/:id', auth, async (req, res) => {
    try {
        const goal = await SavingsGoal.findOneAndDelete({
            _id: req.params.id,
            user_id: req.user._id
        });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 