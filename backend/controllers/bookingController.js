const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");


// CREATE BOOKING
const createBooking = async (req, res) => {
    try {
        const {
            vehicleId,
            startDate,
            endDate
        } = req.body;

        if (!vehicleId || !startDate || !endDate) {
            return res.status(400).json({
                message: "Vehicle, start date and end date are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json({
                message: "Invalid vehicle ID format"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid date format"
            });
        }

        if (start >= end) {
            return res.status(400).json({
                message: "Start date must not be after or equal to end date"
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }


        // DATE OVERLAP CHECK
        const overlappingBooking = await Booking.findOne({
            vehicle: vehicleId,
            status: "confirmed",
            startDate: {
                $lt: end
            },
            endDate: {
                $gt: start
            }
        });


        if (overlappingBooking) {
            return res.status(400).json({
                message: "Vehicle is already booked for these dates"
            });
        }


        // CREATE BOOKING
        const booking = await Booking.create({
            vehicle: vehicleId,
            customer: req.user.id,
            startDate: start,
            endDate: end,
            status: "confirmed"
        });

        const populatedBooking =
            await Booking.findById(booking._id)
                .populate("vehicle")
                .populate("customer", "name email");

        res.status(201).json({
            message: "Booking created successfully",
            booking: populatedBooking
        });

    } catch (error) {
        res.status(500).json({
            message: "Booking failed",
            error: error.message
        });
    }
};


// GET BOOKINGS
const getBookings = async (req, res) => {
    try {
        let bookings;

        if (req.user.role === "admin") {

            bookings = await Booking.find()
                .populate("vehicle")
                .populate("customer", "name email")
                .sort({ createdAt: -1 });

        } else {

            bookings = await Booking.find({
                customer: req.user.id
            })
                .populate("vehicle")
                .sort({ createdAt: -1 });
        }

        res.json({
            count: bookings.length,
            bookings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get bookings",
            error: error.message
        });
    }
};


// CANCEL BOOKING
const cancelBooking = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid booking ID format"
            });
        }

        const booking = await Booking.findById(
            req.params.id
        );

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (
            booking.customer.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You cannot cancel this booking"
            });
        }

        booking.status = "cancelled";

        await booking.save();

        res.json({
            message: "Booking cancelled successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({
            message: "Cancellation failed",
            error: error.message
        });
    }
};


module.exports = {
    createBooking,
    getBookings,
    cancelBooking
};