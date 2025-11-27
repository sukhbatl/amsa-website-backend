import { DataTypes } from "sequelize";

const Role = (sequelize) =>
  sequelize.define("Role", {
    name: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: true }, // "sb" or "tuz"
    year: { type: DataTypes.INTEGER, allowNull: true },
    yearEnd: { type: DataTypes.INTEGER, allowNull: true },
    UserId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    }
  }, {
    tableName: "Roles" // Use same table as amsa-backend-vercel
  });

export default Role;

