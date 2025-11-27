import { DataTypes } from "sequelize";

const Blog = (sequelize) =>
  sequelize.define("Blog", {
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    coverImageUrl: DataTypes.STRING,
    authorId: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: "Blogs" // Unique to amsa-website-backend
  });

export default Blog;
