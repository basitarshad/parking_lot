const express = require("express");
const router = express.Router();
const { ParkingLot, ParkingSlot, ParkedVehicle } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

router.post("/create_parking_lot", async (req, res) => {
  try {
    const { lotName, totalSlots } = req.body;
    const parkingLot = await ParkingLot.create({ lotName, totalSlots });
    for (let i = 1; i <= totalSlots; i++) {
      await ParkingSlot.create({ slotNumber: i });
    }
    res.json({ message: "Parking lot created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/park_vehicle", async (req, res) => {
  try {
    const { lotId, vehicleNumber } = req.body;
    const parkingSlot = await ParkingSlot.findOne({
      where: {
        lotId,
        isAvailable: true,
        isUnderMaintenance: false,
      },
      order: [["slotNumber", "ASC"]],
    });
    if (parkingSlot) {
      const parkedTime = new Date();
      await ParkedVehicle.create({
        vehicleNumber,
        parkedTime,
        slotId: parkingSlot.id,
      });
      await parkingSlot.update({ isAvailable: false });
      res.json({ message: "Vehicle parked successfully" });
    } else {
      res.json({ message: "No available slot" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/unpark_vehicle", async (req, res) => {
  try {
    const { vehicleNumber } = req.body;
    const parkedVehicle = await ParkedVehicle.findOne({
      where: {
        vehicleNumber,
      },
      order: [["parkedTime", "DESC"]],
    });
    if (parkedVehicle) {
      const parkedTime = moment(parkedVehicle.parkedTime);
      const unparkTime = moment();
      const durationHours = unparkTime.diff(parkedTime, "hours") + 1; // Add 1 to round up
      const fee = durationHours * 10;
      await parkedVehicle.destroy();
      const parkingSlot = await ParkingSlot.findByPk(parkedVehicle.slotId);
      await parkingSlot.update({ isAvailable: true });
      res.json({ message: "Vehicle unparked successfully", fee });
    } else {
      res.json({ message: "Vehicle not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/view_parking_lot_status", async (req, res) => {
  try {
    const parkingLots = await ParkingLot.findAll({ include: ParkingSlot });
    const parkingStatus = {};
    for (const parkingLot of parkingLots) {
      parkingStatus[parkingLot.lotName] = {};
      for (const parkingSlot of parkingLot.ParkingSlots) {
        parkingStatus[parkingLot.lotName][parkingSlot.slotNumber] =
          parkingSlot.isAvailable ? "Available" : "Occupied";
      }
    }
    res.json(parkingStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
