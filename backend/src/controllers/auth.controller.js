const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async (req, res, next) => {
  try {
    const { name, surname, email, password, role } = req.body;

    if (!name?.trim())
      return res.status(400).json({ message: "Name is required" });
    if (!surname?.trim())
      return res.status(400).json({ message: "Surname is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({
      name: name.trim(),
      surname: surname.trim(),
      email,
      password,
      role: role === "business" ? "business" : "client",
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const logout = (_req, res) => res.json({ message: "Logged out successfully" });

module.exports = { register, login, getMe, logout };
