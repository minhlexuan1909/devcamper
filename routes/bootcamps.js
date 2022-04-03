const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");
const advancedResult = require("../middleware/advancedResult");
const { protect, authorize } = require("../middleware/auth");
const Bootcamps = require("../models/Bootcamps");
const router = express.Router();

// Include other resources routers
const courseRouter = require("./courses");
// Re-route into other resource routers (Just think of it like forwarding to another route and find in it)
router.use("/:bootcampId/courses", courseRouter);

router
  .route("/")
  .get(advancedResult(Bootcamps, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);
module.exports = router;
