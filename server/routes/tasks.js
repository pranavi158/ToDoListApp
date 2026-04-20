const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { getCache, setCache, delCache } = require('../utils/redis');


// Get All Tasks (Active)
router.get('/', auth, async (req, res) => {
    try {
        const cacheKey = `tasks:user:${req.user.id}:active`;
        const cachedTasks = await getCache(cacheKey);
        
        if (cachedTasks) {
            return res.json(cachedTasks);
        }

        const tasks = await Task.find({ user: req.user.id, deletedAt: null }).sort({ createdAt: -1 });
        await setCache(cacheKey, tasks);
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Get Deleted Tasks
router.get('/trash', auth, async (req, res) => {
    try {
        const cacheKey = `tasks:user:${req.user.id}:trash`;
        const cachedTasks = await getCache(cacheKey);

        if (cachedTasks) {
            return res.json(cachedTasks);
        }

        const tasks = await Task.find({ user: req.user.id, deletedAt: { $ne: null } }).sort({ deletedAt: -1 });
        await setCache(cacheKey, tasks);
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Create Task
router.post('/', auth, async (req, res) => {
    const { title, description, priority, dueDate } = req.body;
    try {
        // Enforce 10-task limit for free users
        const user = await User.findById(req.user.id);
        if (!user.isPremium) {
            const activeCount = await Task.countDocuments({ user: req.user.id, deletedAt: null });
            if (activeCount >= 10) {
                return res.status(403).json({
                    msg: 'Task limit reached. Upgrade to Premium for unlimited tasks.',
                    limitReached: true
                });
            }
        }

        const newTask = new Task({
            title,
            description,
            priority,
            dueDate,
            user: req.user.id
        });
        const task = await newTask.save();
        
        // Invalidate Active cache
        await delCache(`tasks:user:${req.user.id}:active`);
        
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Update Task (Toggle complete, etc)
router.put('/:id', auth, async (req, res) => {
    const { title, description, priority, dueDate, completed } = req.body;

    const taskFields = {};
    if (title) taskFields.title = title;
    if (description !== undefined) taskFields.description = description;
    if (priority) taskFields.priority = priority;
    if (dueDate) taskFields.dueDate = dueDate;
    if (completed !== undefined) taskFields.completed = completed;

    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        task = await Task.findByIdAndUpdate(req.params.id, { $set: taskFields }, { new: true });
        
        // Invalidate cache
        await delCache(`tasks:user:${req.user.id}:active`);
        await delCache(`tasks:user:${req.user.id}:trash`);

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Soft Delete
router.put('/:id/delete', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        task = await Task.findByIdAndUpdate(req.params.id, { $set: { deletedAt: new Date() } }, { new: true });
        
        // Invalidate active and trash caches
        await delCache(`tasks:user:${req.user.id}:active`);
        await delCache(`tasks:user:${req.user.id}:trash`);

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Restore Task
router.put('/:id/restore', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        task = await Task.findByIdAndUpdate(req.params.id, { $set: { deletedAt: null } }, { new: true });
        
        // Invalidate active and trash caches
        await delCache(`tasks:user:${req.user.id}:active`);
        await delCache(`tasks:user:${req.user.id}:trash`);

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Permanently Delete
router.delete('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Task.findByIdAndDelete(req.params.id);
        
        // Invalidate cache
        await delCache(`tasks:user:${req.user.id}:active`);
        await delCache(`tasks:user:${req.user.id}:trash`);

        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
