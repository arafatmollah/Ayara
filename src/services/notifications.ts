import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_ENABLED_KEY = '@quran/learn_reminder_enabled';
const NOTIF_HOUR_KEY = '@quran/learn_reminder_hour';
const NOTIF_MINUTE_KEY = '@quran/learn_reminder_minute';
const NOTIF_ID_KEY = '@quran/learn_reminder_id';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('learn-reminder', {
      name: 'Learn Quran Reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22C55E',
    });
  }

  return true;
}

export async function getReminderSettings(): Promise<{
  enabled: boolean;
  hour: number;
  minute: number;
}> {
  const [enabledStr, hourStr, minuteStr] = await Promise.all([
    AsyncStorage.getItem(NOTIF_ENABLED_KEY),
    AsyncStorage.getItem(NOTIF_HOUR_KEY),
    AsyncStorage.getItem(NOTIF_MINUTE_KEY),
  ]);

  return {
    enabled: enabledStr === 'true',
    hour: hourStr !== null ? parseInt(hourStr, 10) : 22,
    minute: minuteStr !== null ? parseInt(minuteStr, 10) : 0,
  };
}

export async function setReminderTime(hour: number, minute: number): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(NOTIF_HOUR_KEY, String(hour)),
    AsyncStorage.setItem(NOTIF_MINUTE_KEY, String(minute)),
  ]);
}

export async function enableDailyLearnReminder(hour: number = 22, minute: number = 0): Promise<boolean> {
  const granted = await requestNotificationPermissions();
  if (!granted) {
    return false;
  }

  await cancelLearnReminder();
  await setReminderTime(hour, minute);

  const trigger: Notifications.NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to Learn Quran',
      body: 'Take a few minutes to review and learn something from the Quran today.',
      sound: true,
    },
    trigger,
  });

  await Promise.all([
    AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'true'),
    AsyncStorage.setItem(NOTIF_ID_KEY, id),
  ]);

  return true;
}

export async function disableLearnReminder(): Promise<void> {
  await cancelLearnReminder();
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, 'false');
}

export async function cancelLearnReminder(): Promise<void> {
  const id = await AsyncStorage.getItem(NOTIF_ID_KEY);
  if (id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
    await AsyncStorage.removeItem(NOTIF_ID_KEY);
  }
  // Also cancel all notifications with our identifier if somehow multiple exist
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content?.title === 'Time to Learn Quran') {
      try {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      } catch {}
    }
  }
}
