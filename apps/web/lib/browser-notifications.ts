'use client';

/**
 * MediNexa Browser Push Notification Service
 * Manages Web Notifications API permissions, dispatching alerts for
 * medication reminders, missed doses, and upcoming doctor appointments.
 */

export interface BrowserNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

class BrowserNotificationManager {
  private hasSupport(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.hasSupport()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.hasSupport()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      if (typeof window !== 'undefined') {
        localStorage.setItem('medinexa_push_permission', permission);
      }
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  }

  public sendNotification(payload: BrowserNotificationPayload): boolean {
    if (!this.hasSupport() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const notif = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        tag: payload.tag || 'medinexa-alert',
        badge: '/favicon.ico',
        data: payload.data,
      });

      notif.onclick = () => {
        window.focus();
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };

      return true;
    } catch (err) {
      console.warn('Notification dispatch error:', err);
      return false;
    }
  }

  /**
   * Alert when it's time to take medicine
   */
  public notifyMedicineTime(medicineName: string, dosage?: string, timeSlot?: string) {
    const doseText = dosage ? `(${dosage})` : '';
    return this.sendNotification({
      title: `⏰ Medicine Reminder: ${medicineName}`,
      body: `It's time to take your scheduled dose ${doseText}. Stay on track with your health!`,
      tag: `med-time-${medicineName.toLowerCase()}`,
      data: { url: '/portal/medication-reminders' },
    });
  }

  /**
   * Alert for missed medicine dose
   */
  public notifyMissedDose(medicineName: string, scheduledTime?: string) {
    const timeText = scheduledTime ? `scheduled for ${scheduledTime}` : 'scheduled earlier today';
    return this.sendNotification({
      title: `⚠️ Missed Dose Alert: ${medicineName}`,
      body: `You missed your dose of ${medicineName} ${timeText}. Check your schedule or log your intake.`,
      tag: `med-missed-${medicineName.toLowerCase()}`,
      data: { url: '/portal/medication-reminders' },
    });
  }

  /**
   * Alert for upcoming clinical appointment
   */
  public notifyUpcomingAppointment(doctorName: string, appointmentTime: string, specialty?: string) {
    const spec = specialty ? `(${specialty})` : '';
    return this.sendNotification({
      title: `📅 Upcoming Appointment Alert`,
      body: `Consultation with Dr. ${doctorName} ${spec} is scheduled for ${appointmentTime}.`,
      tag: `appt-alert-${doctorName.toLowerCase()}`,
      data: { url: '/portal/appointments' },
    });
  }
}

export const browserNotifications = new BrowserNotificationManager();
