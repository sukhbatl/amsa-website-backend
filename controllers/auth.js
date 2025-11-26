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
    const role = isAmsaAdminEmail(eduEmail) ? "admin" : "member";

    // Create user with transaction to ensure both User and MemberProfile are created
    const result = await db.sequelize.transaction(async (t) => {
      // Sanitize inputs and create user
      const user = await db.User.create({
        eduEmail,
        password: hashedPassword,
        firstName: xss(firstName),
        lastName: xss(lastName),
        role
      }, { transaction: t });

      // Create member profile if any profile data provided
      if (personalEmail || phone || schoolName) {
        await db.MemberProfile.create({
          userId: user.id,
          personalEmail: personalEmail ? xss(personalEmail) : null,
          phone: phone ? xss(phone) : null,
          birthDate: birthDate || null,
          address1: address1 ? xss(address1) : null,
          address2: address2 ? xss(address2) : null,
          city: city ? xss(city) : null,
          state: state ? xss(state) : null,
          zip: zip ? xss(zip) : null,
          schoolName: schoolName ? xss(schoolName) : null,
          schoolCity: schoolCity ? xss(schoolCity) : null,
          schoolState: schoolState ? xss(schoolState) : null,
          degree: degree ? xss(degree) : null,
          gradYear: gradYear ? xss(gradYear) : null,
          schoolYear: schoolYear ? xss(schoolYear) : null,
          major: major ? xss(major) : null,
          secondMajor: secondMajor ? xss(secondMajor) : null,
          facebook: facebook ? xss(facebook) : null,
          instagram: instagram ? xss(instagram) : null,
          linkedin: linkedin ? xss(linkedin) : null
        }, { transaction: t });
      }

      return user;
    });

    const token = makeToken(result);

    logger.info(`New user signup: ${result.eduEmail}`);

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: result.id,
        email: result.eduEmail,
        role: result.role,
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
      where: { eduEmail: normalizedEmail },
      attributes: ["id", "eduEmail", "password", "role", "firstName", "lastName"]
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

    // safety: auto-upgrade if AMSA email but role not admin yet
    if (isAmsaAdminEmail(user.eduEmail) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = makeToken(user);

    logger.info(`User login: ${user.eduEmail}`);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.eduEmail,
        role: user.role,
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
      attributes: ["id", "eduEmail", "role", "firstName", "lastName"]
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (e) {
    logger.error("Me endpoint error:", e);
    res.status(500).json({ message: "Failed to load user" });
  }
}
