const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const ParkedVehicle = sequelize.define("ParkedVehicle", {
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parkedTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = ParkedVehicle;
