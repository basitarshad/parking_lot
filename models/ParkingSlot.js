const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const ParkingSlot = sequelize.define("ParkingSlot", {
  slotNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  isUnderMaintenance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = ParkingSlot;
