import { Response } from 'express';
import { Notification } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const notifications = await Notification.find({
    $or: [{ user_id: req.user!.user_id }, { organization_id: req.user!.organization_id }],
  }).sort({ created_at: -1 });

  res.json({
    data: notifications,
    unread_count: notifications.filter((n) => !n.read).length,
  });
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const notif = await Notification.findOneAndUpdate(
    { notification_id: id },
    { read: true, read_at: new Date() },
    { new: true }
  );

  if (!notif) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    return;
  }

  res.json({ data: notif });
}
