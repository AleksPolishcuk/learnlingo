const Availability = require("../models/Calendar");

const getAvailability = async (req, res, next) => {
  try {
    let avail = await Availability.findOne({ teacher: req.user._id });
    if (!avail) {
      avail = await Availability.create({ teacher: req.user._id });
    }
    res.json({ availability: avail });
  } catch (err) {
    next(err);
  }
};

const updateWeeklySlots = async (req, res, next) => {
  try {
    const { weeklySlots, lessonDuration, timezone } = req.body;

    const avail = await Availability.findOneAndUpdate(
      { teacher: req.user._id },
      {
        $set: {
          weeklySlots: weeklySlots ?? [],
          ...(lessonDuration && { lessonDuration }),
          ...(timezone && { timezone }),
        },
      },
      { new: true, upsert: true },
    );
    res.json({ availability: avail });
  } catch (err) {
    next(err);
  }
};

const addSpecialSlot = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime)
      return res
        .status(400)
        .json({ message: "date, startTime and endTime are required" });

    const avail = await Availability.findOneAndUpdate(
      { teacher: req.user._id },
      { $push: { specialSlots: { date, startTime, endTime } } },
      { new: true, upsert: true },
    );
    res.json({ availability: avail });
  } catch (err) {
    next(err);
  }
};

const deleteSpecialSlot = async (req, res, next) => {
  try {
    const avail = await Availability.findOneAndUpdate(
      { teacher: req.user._id },
      { $pull: { specialSlots: { _id: req.params.slotId } } },
      { new: true },
    );
    res.json({ availability: avail });
  } catch (err) {
    next(err);
  }
};

const addBlockedRange = async (req, res, next) => {
  try {
    const { startDate, endDate, label } = req.body;
    if (!startDate || !endDate)
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });

    const avail = await Availability.findOneAndUpdate(
      { teacher: req.user._id },
      {
        $push: {
          blockedRanges: { startDate, endDate, label: label || "Blocked" },
        },
      },
      { new: true, upsert: true },
    );
    res.json({ availability: avail });
  } catch (err) {
    next(err);
  }
};

const deleteBlockedRange = async (req, res, next) => {
  try {
    const avail = await Availability.findOneAndUpdate(
      { teacher: req.user._id },
      { $pull: { blockedRanges: { _id: req.params.rangeId } } },
      { new: true },
    );
    res.json({ availability: avail });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailability,
  updateWeeklySlots,
  addSpecialSlot,
  deleteSpecialSlot,
  addBlockedRange,
  deleteBlockedRange,
};
