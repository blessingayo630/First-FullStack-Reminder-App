import { getMessagingInstance } from './firebase';

export async function requestNotificationPermission() {
  try {
    if (typeof window === 'undefined') return null;

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log('Messaging not supported in this environment');
      return null;
    }

    const { getToken } = await import('firebase/messaging');
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    console.log('FCM Token:', token);

    return token;
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
} 
