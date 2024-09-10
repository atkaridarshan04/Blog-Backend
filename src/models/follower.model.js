import { DataTypes } from "sequelize";
import { sequelize } from "../db/connect.js";

const Follower = sequelize.define("Follower", {
    followerId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "Users",
            key: 'id'
        }
    },
    followingId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "Users",
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,  // Ensures a user can't follow the same person twice
            fields: ['followerId', 'followingId']
        }
    ]
});

export default Follower;
