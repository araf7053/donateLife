const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//  Helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // include role — avoids extra DB call in middleware
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// REGISTER 
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Password strength
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Duplicate check
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email already registered" }); // 409 Conflict is more accurate than 400
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user — only pass fields that exist in User schema
    const user = await User.create({
      name,
      email,
      password_hash,
      role: role || "donor",
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Register error:", error); // log full error server-side
    res.status(500).json({ message: "Server error during registration" });
  }
};

// LOGIN 
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user and include password_hash
    const user = await User.findOne({ email }).select("+password_hash");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }); // 401 not 400
    }

    // Check account is active
    if (!user.is_active) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" }); // same message as above — prevents email enumeration
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};