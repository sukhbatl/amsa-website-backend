// controllers/user.js
import db from "../models/index.js";
import logger from "../utils/logger.js";

export async function getPublicUser(req, res) {
  try {
    const { User } = db;
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Exclude sensitive information for public profiles
    const exclude = [
      "password",
      "hash",
      "hashExpiresAt",
      "birthday",
      "address1",
      "address2",
      "city",
      "state",
      "zipCode",
      "phoneNumber",
      "acceptanceStatus",
      "emailVerified",
      "level",
      "schoolCity",
      "schoolState",
      "schoolYear",
      "email",
      "personalEmail",
    ];

    const user = await User.findByPk(userId, {
      attributes: { exclude },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info(`Public profile viewed for user ID: ${userId}`);

    return res.status(200).json(user);
  } catch (e) {
    logger.error("Get public user error:", e);
    return res.status(500).json({
      message: "Server not available",
      error: e.message
    });
  }
}

export async function getUserProfile(req, res) {
  try {
    const { User } = db;
    const userId = req.params.id || req.user.id; // Use param if viewing other user, otherwise own profile

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // For viewing other users, exclude sensitive info
    // For own profile, show everything except password
    const isOwnProfile = req.user.id === parseInt(userId);
    const exclude = isOwnProfile 
      ? ["password", "hash", "hashExpiresAt"]
      : [
          "password",
          "hash",
          "hashExpiresAt",
          "birthday",
          "address1",
          "address2",
          "city",
          "state",
          "zipCode",
          "phoneNumber",
          "acceptanceStatus",
          "emailVerified",
          "level",
          "schoolCity",
          "schoolState",
          "schoolYear",
        ];

    const user = await User.findByPk(userId, {
      attributes: { exclude },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info(`User profile viewed: ${userId} by user ${req.user.id}`);

    return res.status(200).json(user);
  } catch (e) {
    logger.error("Get user profile error:", e);
    return res.status(500).json({
      message: "Server not available",
      error: e.message
    });
  }
}

export async function getMembers(req, res) {
  try {
    const { Role, User } = db;

    if (!Role || !User) {
      return res.status(503).json({ message: "DB not ready" });
    }

    const members = await Role.findAll({
      attributes: ["UserId", "name", "year", "yearEnd", "role"],
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName", "email", "schoolName", "profilePic", "linkedin"],
        },
      ],
    });

    const tuz_filter = [];
    const sb_filter = [];
    const current_tuz_filter = [];

    // Collecting the Strategy Board members
    for (let i = 0; i < members.length; i++) {
      if (members[i].role === "sb") {
        sb_filter.push(members[i]);
      } else if (members[i].role === "tuz") {
        tuz_filter.push(members[i]);
      }
    }

    // Collecting the current Executive Board members (2025)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < members.length; i++) {
      if (members[i].role === "tuz" && members[i].year === currentYear) {
        current_tuz_filter.push(members[i]);
      }
    }

    // Collecting the TUZ members in terms of year
    const years = Array.from(new Set(tuz_filter.map((x) => x.year).filter(Boolean)));

    const tuz_members_object = {};

    for (let i = 0; i < years.length; i++) {
      tuz_members_object[years[i]] = [];
    }

    for (let i = 0; i < tuz_filter.length; i++) {
      const member = tuz_filter[i];
      if (member.year) {
        tuz_members_object[member.year].push(member);
      }
    }

    logger.info(`Fetched ${sb_filter.length} SB members, ${current_tuz_filter.length} current TUZ members, ${tuz_filter.length} total TUZ members`);

    return res.status(200).json({ 
      tuz: tuz_members_object, 
      sb: sb_filter, 
      current_tuz: current_tuz_filter 
    });
  } catch (e) {
    logger.error("Get members error:", e);
    return res.status(500).json({
      message: "Server not available",
      error: e.message
    });
  }
}

