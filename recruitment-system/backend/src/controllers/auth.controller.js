const User = require('../models/User');
const Company = require('../models/Company');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    let companyRef = null;
    if (role === 'company') {
      const company = await Company.create({ name: name + ' Company', description: 'Auto-created during registration' });
      companyRef = company._id;
    }
    const user = await User.create({ name, email, passwordHash: hash, role, companyRef });
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    // sign token with id and role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '6h' });

    // return explicit structure expected by frontend
    return res.json({
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyRef: user.companyRef || null
      }
    });
  } catch (err) {
    next(err);
  }
};
