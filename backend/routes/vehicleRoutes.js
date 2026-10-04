const express = require("express");

const {
    createVehicle,
    getVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
} = require("../controllers/vehicleController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// Anyone can view vehicles
router.get("/", getVehicles);

router.get("/:id", getVehicle);


// Only admin can create
router.post(
    "/",
    protect,
    adminOnly,
    upload.single("document"),
    createVehicle
);


// Only admin can update
router.put(
    "/:id",
    protect,
    adminOnly,
    upload.single("document"),
    updateVehicle
);

router.patch(
    "/:id",
    protect,
    adminOnly,
    upload.single("document"),
    updateVehicle
);


// Only admin can delete
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteVehicle
);


module.exports = router;