// server/controllers/auth.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import xss from "xss";
import db from "../models/index.js";
import JWT_SECRET from "../utils/jwt.js";
import logger from "../utils/logger.js";

const isAmsaAdminEmail = (email) => email?.toLowerCase().endsWith("@amsa.mn");

function makeToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function signup(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      personalEmail,
      phone,
      birthDate,
      address1,
      address2,
      city,
      state,
      zip,
      schoolName,
      schoolCity,
      schoolState,
      degree,
      gradYear,
      schoolYear,
      major,
      secondMajor,
      facebook,
      instagram,
      linkedin
    } = req.body;

    const eduEmail = email?.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await db.User.findOne({
      where: { eduEmail },
      attributes: ["id", "eduEmail"]
    });

    if (exists) {
      // Don't reveal that email exists - generic error
      return res.status(400).json({ message: "Unable to complete registration. Please check your information." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all fields in the Users table (shared with amsa-backend-vercel)
    const result = await db.User.create({
      // Core fields
      email: eduEmail,
      password: hashedPassword,
      firstName: firstName ? xss(firstName) : null,
      lastName: lastName ? xss(lastName) : null,
      
      // Personal info
      birthday: birthDate || null,
      address1: address1 ? xss(address1) : null,
      address2: address2 ? xss(address2) : null,
      city: city ? xss(city) : null,
      state: state ? xss(state) : null,
      zipCode: zip ? xss(zip) : null,
      phoneNumber: phone ? xss(phone) : null,
      personalEmail: personalEmail ? xss(personalEmail) : null,
      
      // School info
      schoolName: schoolName ? xss(schoolName) : null,
      schoolCity: schoolCity ? xss(schoolCity) : null,
      schoolState: schoolState ? xss(schoolState) : null,
      degreeLevel: degree ? xss(degree) : null,
      graduationYear: gradYear ? xss(gradYear) : null,
      schoolYear: schoolYear ? xss(schoolYear) : null,
      major: major ? xss(major) : null,
      major2: secondMajor ? xss(secondMajor) : null,
      
      // Social
      facebook: facebook ? xss(facebook) : null,
      instagram: instagram ? xss(instagram) : null,
      linkedin: linkedin ? xss(linkedin) : null,
      
      // Auth
      emailVerified: false
    });

    const token = makeToken(result);

    logger.info(`New user signup: ${result.email}`);

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName
      },
      token
    });
  } catch (e) {
    logger.error("Signup error:", e);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.User.findOne({
      where: { email: normalizedEmail },
      attributes: ["id", "email", "password", "firstName", "lastName", "level"]
    });

    if (!user) {
      // Generic error - don't reveal if email exists
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Generic error - don't reveal which part is wrong
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Determine role based on email and level
    const role = isAmsaAdminEmail(user.email) || user.level >= 10 ? "admin" : "member";

    const token = makeToken({ id: user.id, role });

    logger.info(`User login: ${user.email}`);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (e) {
    logger.error("Login error:", e);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
}

export async function me(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ["id", "email", "firstName", "lastName", "level"]
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Determine role
    const role = isAmsaAdminEmail(user.email) || user.level >= 10 ? "admin" : "member";
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        role: role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (e) {
    logger.error("Me endpoint error:", e);
    res.status(500).json({ message: "Failed to load user" });
  }
}
