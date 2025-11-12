import Notification from "../models/Notification.js";


// API to get notifications

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('taskId', 'title status')
            .populate('projectId', 'title');

        res.status(200).json({
            status: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error fetching notifications"
        });
    }
}

export const markAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                status: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            status: true,
            notification
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Error updating notification"
        });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            status: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Error updating notifications"
        });
    }
};

export const deleteNotification = async (req, res) => {
    const { id } = req.params;
    console.log("Delete Notification ID:", id);
    try {
        const notification = await Notification.findOneAndDelete({
            _id: id
        });

        if (!notification) {
            return res.status(404).json({
                status: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Notification deleted"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Error deleting notification"
        });
    }
};
