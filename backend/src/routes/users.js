const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to check JWT token
const authMiddleware = async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
        
        if (!req.user || !req.user.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized' 
            });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized' 
        });
    }
};

// Middleware to check role
const requireRole = (roles) => {
    return async (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Required roles: ${roles.join(', ')}` 
            });
        }
        next();
    };
};

// @route   GET /api/users
// @desc    Get all users (admin/moderator only)
// @access  Private/Admin, Moderator
router.get('/', authMiddleware, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const users = await User.findAll({ 
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { 
            attributes: { exclude: ['password'] } 
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = { router, authMiddleware, requireRole };
