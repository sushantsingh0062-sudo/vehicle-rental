const express = require("express");

const {
    createBooking,
    getBookings,
    cancelBooking
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create booking
router.post(
    "/",
    protect,
    createBooking
);


// Get bookings
router.get(
    "/",
    protect,
    getBookings
);


// Cancel booking
router.patch(
    "/:id/cancel",
    protect,
    cancelBooking
);

router.patch(
    "/:id",
    protect,
    cancelBooking
);

router.put(
    "/:id/cancel",
    protect,
    cancelBooking
);


module.exports = router;