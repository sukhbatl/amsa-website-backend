import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import BlogModel from "./blog.js";
import AnnouncementModel from "./announcement.js";
import MemberProfileModel from "./memberProfile.js";
import RoleModel from "./role.js";

// Define User model - SHARED with amsa-backend-vercel (same table schema)
const User = sequelize.define("User", {
  // Core fields
  firstName: { type: DataTypes.STRING, allowNull: true },
  lastName: { type: DataTypes.STRING, allowNull: true },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: { type: DataTypes.STRING, allowNull: false },
  
  // Personal info
  birthday: DataTypes.STRING,
  address1: DataTypes.STRING,
  address2: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zipCode: DataTypes.STRING,
  phoneNumber: DataTypes.STRING,
  personalEmail: DataTypes.STRING,
  
  // Social
  facebook: DataTypes.STRING,
  linkedin: DataTypes.STRING,
  instagram: DataTypes.STRING,
  
  // School info
  acceptanceStatus: DataTypes.STRING,
  schoolYear: DataTypes.STRING,
  schoolState: DataTypes.STRING,
  schoolCity: DataTypes.STRING,
  degreeLevel: DataTypes.STRING,
  graduationYear: DataTypes.STRING,
  major: DataTypes.STRING,
  major2: DataTypes.STRING,
  schoolName: DataTypes.STRING,
  
  // Auth & verification
  hash: DataTypes.STRING,
  hashExpiresAt: DataTypes.DATE,
  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // Additional
  level: DataTypes.INTEGER,
  bio: DataTypes.TEXT,
  profilePic: DataTypes.STRING
}, {
  tableName: "Users" // Use same table as amsa-backend-vercel
});

// Other models - using prefixed table names to avoid conflicts
const Blog = BlogModel(sequelize);
const Announcement = AnnouncementModel(sequelize);
const Role = RoleModel(sequelize);

// Associations
User.hasMany(Blog, { foreignKey: "authorId" });
Blog.belongsTo(User, { foreignKey: "authorId" });

User.hasMany(Announcement, { foreignKey: "authorId" });
Announcement.belongsTo(User, { foreignKey: "authorId" });

User.hasMany(Role, { foreignKey: "UserId" });
Role.belongsTo(User, { foreignKey: "UserId" });

// Note: MemberProfile is not used - all user fields are in the Users table
// This matches the amsa-backend-vercel schema

export default { sequelize, Sequelize, User, Blog, Announcement, Role };

