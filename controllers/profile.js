// server/controllers/profile.js
import bcrypt from "bcryptjs";
import xss from "xss";
import db from "../models/index.js";
import logger from "../utils/logger.js";

export async function getProfile(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ profile: user });
  } catch (e) {
    logger.error("Get profile error:", e);
    res.status(500).json({ message: "Failed to load profile" });
  }
}

export async function updateProfile(req, res) {
  try {
    const {
      firstName,
      lastName,
      personalEmail,
      birthday,
      address1,
      address2,
      city,
      state,
      zipCode,
      phoneNumber,
      facebook,
      instagram,
      linkedin,
      schoolName,
      schoolCity,
      schoolState,
      degreeLevel,
      graduationYear,
      schoolYear,
      major,
      major2,
      bio
    } = req.body;

    const user = await db.User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields with XSS sanitization
    if (firstName !== undefined) user.firstName = firstName ? xss(firstName) : null;
    if (lastName !== undefined) user.lastName = lastName ? xss(lastName) : null;
    if (personalEmail !== undefined) user.personalEmail = personalEmail ? xss(personalEmail) : null;
    if (birthday !== undefined) user.birthday = birthday || null;
    if (address1 !== undefined) user.address1 = address1 ? xss(address1) : null;
    if (address2 !== undefined) user.address2 = address2 ? xss(address2) : null;
    if (city !== undefined) user.city = city ? xss(city) : null;
    if (state !== undefined) user.state = state ? xss(state) : null;
    if (zipCode !== undefined) user.zipCode = zipCode ? xss(zipCode) : null;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber ? xss(phoneNumber) : null;
    if (facebook !== undefined) user.facebook = facebook ? xss(facebook) : null;
    if (instagram !== undefined) user.instagram = instagram ? xss(instagram) : null;
    if (linkedin !== undefined) user.linkedin = linkedin ? xss(linkedin) : null;
    if (schoolName !== undefined) user.schoolName = schoolName ? xss(schoolName) : null;
    if (schoolCity !== undefined) user.schoolCity = schoolCity ? xss(schoolCity) : null;
    if (schoolState !== undefined) user.schoolState = schoolState ? xss(schoolState) : null;
    if (degreeLevel !== undefined) user.degreeLevel = degreeLevel ? xss(degreeLevel) : null;
    if (graduationYear !== undefined) user.graduationYear = graduationYear ? xss(graduationYear) : null;
    if (schoolYear !== undefined) user.schoolYear = schoolYear ? xss(schoolYear) : null;
    if (major !== undefined) user.major = major ? xss(major) : null;
    if (major2 !== undefined) user.major2 = major2 ? xss(major2) : null;
    if (bio !== undefined) user.bio = bio ? xss(bio) : null;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      message: "Profile updated successfully",
      profile: await db.User.findByPk(user.id, {
        attributes: { exclude: ["password"] }
      })
    });
  } catch (e) {
    logger.error("Update profile error:", e);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await db.User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({ message: "Password changed successfully" });
  } catch (e) {
    logger.error("Change password error:", e);
    res.status(500).json({ message: "Failed to change password" });
  }
}

