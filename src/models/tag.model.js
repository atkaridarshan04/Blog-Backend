import { DataTypes } from 'sequelize';
import { sequelize } from "../db/connect.js";

const Tag = sequelize.define('Tag', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true
});

export default Tag;
