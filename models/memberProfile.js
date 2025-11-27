import { DataTypes } from "sequelize";

const MemberProfile = (sequelize) =>
    sequelize.define("MemberProfile", {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: "website_users", // Reference the prefixed table
                key: "id"
            }
        },
        personalEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: { isEmail: true }
        },
        phone: DataTypes.STRING,
        birthDate: DataTypes.DATEONLY,
        address1: DataTypes.STRING,
        address2: DataTypes.STRING,
        city: DataTypes.STRING,
        state: DataTypes.STRING,
        zip: DataTypes.STRING,
        schoolName: DataTypes.STRING,
        schoolCity: DataTypes.STRING,
        schoolState: DataTypes.STRING,
        degree: DataTypes.STRING,
        gradYear: DataTypes.STRING,
        schoolYear: DataTypes.STRING,
        major: DataTypes.STRING,
        secondMajor: DataTypes.STRING,
        facebook: DataTypes.STRING,
        instagram: DataTypes.STRING,
        linkedin: DataTypes.STRING
    }, {
        tableName: "website_member_profiles" // Use prefixed table name to avoid conflicts
    });

export default MemberProfile;
