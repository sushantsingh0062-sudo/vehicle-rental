const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");


// CREATE VEHICLE
const createVehicle = async (req, res) => {
    try {
        const {
            vehicleNumber,
            model,
            type,
            pricePerDay
        } = req.body;

        if (
            !vehicleNumber ||
            !model ||
            !type ||
            pricePerDay === undefined ||
            pricePerDay === null
        ) {
            return res.status(400).json({
                message: "All vehicle fields are required"
            });
        }

        const numericPrice = Number(pricePerDay);
        if (isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                message: "Price per day must be a valid positive number"
            });
        }

        const existingVehicle =
            await Vehicle.findOne({ vehicleNumber });

        if (existingVehicle) {
            return res.status(400).json({
                message: "Vehicle number already exists"
            });
        }

        const documentPath = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const vehicle = await Vehicle.create({
            vehicleNumber,
            model,
            type,
            pricePerDay: numericPrice,
            documentPath
        });

        res.status(201).json({
            message: "Vehicle created successfully",
            vehicle
        });

    } catch (error) {
        res.status(500).json({
            message: "Vehicle creation failed",
            error: error.message
        });
    }
};


// GET ALL VEHICLES
const getVehicles = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let vehicles = await Vehicle.find().sort({ createdAt: -1 });

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end) {
                const bookedVehicles = await Booking.find({
                    status: "confirmed",
                    startDate: { $lt: end },
                    endDate: { $gt: start }
                }).distinct("vehicle");

                const bookedVehicleIds = new Set(bookedVehicles.map(id => id.toString()));

                const vehicleList = vehicles.map(v => {
                    const obj = v.toObject();
                    obj.isAvailable = !bookedVehicleIds.has(v._id.toString());
                    return obj;
                });

                return res.json({
                    count: vehicleList.length,
                    vehicles: vehicleList
                });
            }
        }

        res.json({
            count: vehicles.length,
            vehicles
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get vehicles",
            error: error.message
        });
    }
};


// GET SINGLE VEHICLE
const getVehicle = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid vehicle ID format"
            });
        }

        const vehicle = await Vehicle.findById(
            req.params.id
        );

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        const { startDate, endDate } = req.query;
        const vehicleObj = vehicle.toObject();

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end) {
                const overlapping = await Booking.findOne({
                    vehicle: vehicle._id,
                    status: "confirmed",
                    startDate: { $lt: end },
                    endDate: { $gt: start }
                });

                vehicleObj.isAvailable = !overlapping;
            }
        }

        res.json(vehicleObj);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get vehicle",
            error: error.message
        });
    }
};


// UPDATE VEHICLE
const updateVehicle = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid vehicle ID format"
            });
        }

        const vehicle = await Vehicle.findById(
            req.params.id
        );

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        const {
            vehicleNumber,
            model,
            type,
            pricePerDay
        } = req.body;

        if (vehicleNumber) {
            vehicle.vehicleNumber = vehicleNumber;
        }

        if (model) {
            vehicle.model = model;
        }

        if (type) {
            vehicle.type = type;
        }

        if (pricePerDay !== undefined && pricePerDay !== null && pricePerDay !== "") {
            const numericPrice = Number(pricePerDay);
            if (isNaN(numericPrice) || numericPrice < 0) {
                return res.status(400).json({
                    message: "Price per day must be a valid positive number"
                });
            }
            vehicle.pricePerDay = numericPrice;
        }

        if (req.file) {
            vehicle.documentPath =
                `/uploads/${req.file.filename}`;
        }

        await vehicle.save();

        res.json({
            message: "Vehicle updated successfully",
            vehicle
        });

    } catch (error) {
        res.status(500).json({
            message: "Vehicle update failed",
            error: error.message
        });
    }
};


// DELETE VEHICLE
const deleteVehicle = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid vehicle ID format"
            });
        }

        const vehicle = await Vehicle.findByIdAndDelete(
            req.params.id
        );

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        res.json({
            message: "Vehicle deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Vehicle deletion failed",
            error: error.message
        });
    }
};


module.exports = {
    createVehicle,
    getVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
};