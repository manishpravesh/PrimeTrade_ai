const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { jwtSecret } = require('../config/env');
const { validate } = require('../middleware/validate');
const { createUser, findUserByEmail } = require('../services/store');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 80 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await createUser({ name, email, passwordHash, role: 'user' });
      return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/login',
  [body('email').trim().isEmail().normalizeEmail(), body('password').isString().isLength({ min: 8, max: 128 })],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '1h' });
      return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
