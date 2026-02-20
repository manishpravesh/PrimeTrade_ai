const express = require('express');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { listUsers } = require('../services/store');

const router = express.Router();

router.use(authenticate, authorizeRole('admin'));

router.get('/users', async (req, res, next) => {
  try {
    const users = await listUsers();
    return res.status(200).json(users.map(({ id, name, email, role }) => ({ id, name, email, role })));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
