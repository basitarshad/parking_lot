const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const PORT = process.env.PORT || 3000;

// Sequelize setup
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "parking_lot.db",
});

// Define models
const ParkingLot = sequelize.define("ParkingLot", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalSlots: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

const ParkingSlot = sequelize.define("ParkingSlot", {
  slotNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("AVAILABLE", "OCCUPIED", "MAINTENANCE"),
    defaultValue: "AVAILABLE",
    allowNull: false,
  },
});

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

// Define associations
ParkingLot.hasMany(ParkingSlot);
ParkingSlot.belongsTo(ParkingLot);
ParkedVehicle.belongsTo(ParkingSlot);

// Middlewares
app.use(bodyParser.json());

// Create Parking Lot
app.post("/parking-lots", async (req, res) => {
  try {
    const { name, totalSlots } = req.body;
    const parkingLot = await ParkingLot.create({ name, totalSlots });
    for (let i = 1; i <= totalSlots; i++) {
      await ParkingSlot.create({ slotNumber: i, ParkingLotId: parkingLot.id });
    }
    res.status(201).json(parkingLot);
  } catch (error) {
    res.status(500).json({ error: "Could not create parking lot" });
  }
});

// Park Vehicle
app.post("/parking-lots/:id/park", async (req, res) => {
  try {
    const { vehicleNumber } = req.body;
    const parkingLotId = req.params.id;
    const parkingSlot = await ParkingSlot.findOne({
      where: { ParkingLotId: parkingLotId, status: "AVAILABLE" },
    });
    if (!parkingSlot) {
      return res.status(400).json({ error: "No available slots" });
    }
    await parkingSlot.update({ status: "OCCUPIED" });
    const parkedVehicle = await ParkedVehicle.create({
      vehicleNumber,
      parkedTime: new Date(),
      ParkingSlotId: parkingSlot.id,
    });
    res.status(201).json(parkedVehicle);
  } catch (error) {
    res.status(500).json({ error: "Could not park vehicle" });
  }
});

// Unpark Vehicle
app.post("/parking-lots/:id/unpark", async (req, res) => {
  try {
    const { vehicleNumber } = req.body;
    const parkingLotId = req.params.id;
    const parkedVehicle = await ParkedVehicle.findOne({
      where: { vehicleNumber, "$ParkingSlot.ParkingLotId$": parkingLotId },
      include: ParkingSlot,
    });
    if (!parkedVehicle) {
      return res.status(400).json({ error: "Vehicle not found" });
    }
    const parkedTime = new Date(parkedVehicle.parkedTime);
    const currentTime = new Date();
    const parkingFee =
      10 * Math.ceil((currentTime - parkedTime) / (1000 * 60 * 60));
    await parkedVehicle.ParkingSlot.update({ status: "AVAILABLE" });
    await parkedVehicle.destroy();
    res.json({ message: "Vehicle unparked successfully", parkingFee });
  } catch (error) {
    res.status(500).json({ error: "Could not unpark vehicle" });
  }
});

// Set Slot Status to Maintenance
app.post("/parking-lots/:id/slot/:slotNumber/maintenance", async (req, res) => {
  try {
    const parkingLotId = req.params.id;
    const slotNumber = req.params.slotNumber;
    const parkingSlot = await ParkingSlot.findOne({
      where: { ParkingLotId: parkingLotId, slotNumber },
    });
    if (!parkingSlot) {
      return res.status(400).json({ error: "Parking slot not found" });
    }
    await parkingSlot.update({ status: "MAINTENANCE" });
    res.json({ message: "Slot set to maintenance" });
  } catch (error) {
    res.status(500).json({ error: "Could not set slot to maintenance" });
  }
});

// Set Slot Status to Working
app.post("/parking-lots/:id/slot/:slotNumber/working", async (req, res) => {
  try {
    const parkingLotId = req.params.id;
    const slotNumber = req.params.slotNumber;
    const parkingSlot = await ParkingSlot.findOne({
      where: { ParkingLotId: parkingLotId, slotNumber },
    });
    if (!parkingSlot) {
      return res.status(400).json({ error: "Parking slot not found" });
    }
    await parkingSlot.update({ status: "AVAILABLE" });
    res.json({ message: "Slot set to working" });
  } catch (error) {
    res.status(500).json({ error: "Could not set slot to working" });
  }
});

// Get Total Vehicles Parked on a Day
app.get("/parking-lots/:id/total-parked", async (req, res) => {
  try {
    const parkingLotId = req.params.id;
    const parkedVehicles = await ParkedVehicle.count({
      where: { "$ParkingSlot.ParkingLotId$": parkingLotId },
    });
    res.json({ totalParked: parkedVehicles });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch total parked vehicles" });
  }
});

// Get Total Parking Time on a Day
app.get("/parking-lots/:id/total-parking-time", async (req, res) => {
  try {
    const parkingLotId = req.params.id;
    const parkedVehicles = await ParkedVehicle.findAll({
      where: { "$ParkingSlot.ParkingLotId$": parkingLotId },
    });
    let totalParkingTime = 0;
    parkedVehicles.forEach((vehicle) => {
      const parkedTime = new Date(vehicle.parkedTime);
      const currentTime = new Date();
      totalParkingTime += (currentTime - parkedTime) / (1000 * 60 * 60);
    });
    res.json({ totalParkingTime });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch total parking time" });
  }
});

// Get Total Fee Collected on a Day
app.get("/parking-lots/:id/total-fee", async (req, res) => {
  try {
    const parkingLotId = req.params.id;
    const parkedVehicles = await ParkedVehicle.findAll({
      where: { "$ParkingSlot.ParkingLotId$": parkingLotId },
    });
    let totalFee = 0;
    parkedVehicles.forEach((vehicle) => {
      const parkedTime = new Date(vehicle.parkedTime);
      const currentTime = new Date();
      const parkingHours = Math.ceil(
        (currentTime - parkedTime) / (1000 * 60 * 60)
      );
      totalFee += 10 * parkingHours;
    });
    res.json({ totalFee });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch total fee collected" });
  }
});

// Server start
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
