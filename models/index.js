import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import BlogModel from "./blog.js";
import AnnouncementModel from "./announcement.js";
import MemberProfileModel from "./memberProfile.js";

// Define User model with table prefix to avoid conflicts with amsa-backend-vercel
const User = sequelize.define("User", {
  eduEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
    field: "email" // keep DB column compatible if previously named `email`
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "member"
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "website_users" // Use prefixed table name to avoid conflicts
});

// Other models
const Blog = BlogModel(sequelize);
const Announcement = AnnouncementModel(sequelize);
const MemberProfile = MemberProfileModel(sequelize);

// Associations
User.hasMany(Blog, { foreignKey: "authorId" });
Blog.belongsTo(User, { foreignKey: "authorId" });

User.hasMany(Announcement, { foreignKey: "authorId" });
Announcement.belongsTo(User, { foreignKey: "authorId" });

User.hasOne(MemberProfile, { foreignKey: "userId", as: "profile" });
MemberProfile.belongsTo(User, { foreignKey: "userId" });

export default { sequelize, Sequelize, User, Blog, Announcement, MemberProfile };

