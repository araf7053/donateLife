const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !bloodGroup || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password_hash,
      bloodGroup,
      phone,
      role: role || "donor",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res
      .status(201)
      .json({ token, user: { id: user._id, name : user.name, email :user.email, bloodGroup : user.bloodGroup } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//LOGIN USER




exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
//  Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

// Find user (IMPORTANT: include password)
    const user = await User.findOne({ email }).select("+password_hash");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

//  Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

//  Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

//  Response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};