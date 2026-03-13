const Notification = require("../models/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const filter = { recipient: req.user._id };
    if (req.query.unread === "true") filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

const markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { read: true } },
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAllRead, markOneRead };
