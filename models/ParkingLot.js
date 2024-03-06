const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const ParkingLot = sequelize.define("ParkingLot", {
  lotName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalSlots: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = ParkingLot;
