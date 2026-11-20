const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateToken } = require('../config/jwt');

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Field presence validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Required field missing. Please fill in all fields.'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long.'
      });
    }

    // Email format validation
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please log in or use another email.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), normalizedEmail, hashedPassword]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail
    };

    const token = generateToken(user, true);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, rememberMe = true } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Required field missing. Please enter both email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up user
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const userRecord = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email
    };

    const token = generateToken(user, rememberMe);

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, currentPassword, newPassword } = req.body;

    if (name && name.trim().length >= 2) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id]);
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
      }

      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    }

    const [updatedRows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
