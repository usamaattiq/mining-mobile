import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'shared.deviceId';

function generateId(): string {
  const random = Math.random().toString(36).slice(2);
  const timestamp = Date.now().toString(36);
  return `${timestamp}${random}`.padEnd(16, '0').slice(0, 32);
}

let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    cachedDeviceId = existing;
    return existing;
  }

  const created = generateId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, created);
  cachedDeviceId = created;
  return created;
}
