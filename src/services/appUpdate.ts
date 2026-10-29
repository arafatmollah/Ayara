import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendReleaseNotification } from './notifications';

const GITHUB_REPO = 'arafatmollah/Ayara'; // Update if different
const LAST_NOTIFIED_RELEASE_KEY = '@quran/last_notified_release_version';

export function getCurrentVersion(): string {
  return Constants.expoConfig?.version || (Constants as any).manifest?.version || '1.0.0';
}

export async function checkForGitHubUpdate(): Promise<{
  hasUpdate: boolean;
  latestVersion?: string;
  releaseUrl?: string;
  releaseNotes?: string;
}> {
  try {
    const current = getCurrentVersion();
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Ayara-App',
      },
    });
    
    if (!response.ok) {
      return { hasUpdate: false };
    }
    
    const release = await response.json();
    const latestTag = release.tag_name || release.name || '';
    const latestVersion = latestTag.replace(/^v/i, '');
    
    if (isNewerVersion(latestVersion, current)) {
      return {
        hasUpdate: true,
        latestVersion,
        releaseUrl: release.html_url,
        releaseNotes: release.body,
      };
    }
    
    return { hasUpdate: false };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return { hasUpdate: false };
  }
}

function isNewerVersion(latest: string, current: string): boolean {
  const latestParts = latest.split('.').map((n) => parseInt(n, 10) || 0);
  const currentParts = current.split('.').map((n) => parseInt(n, 10) || 0);
  
  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export async function promptForUpdate(releaseUrl: string, latestVersion: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (
      typeof window !== 'undefined' &&
      window.confirm(
        `A new version (${latestVersion}) is available. Would you like to view and download it from GitHub?`
      )
    ) {
      await Linking.openURL(releaseUrl);
    }
    return;
  }

  Alert.alert(
    'Update Available',
    `A new version (${latestVersion}) is available. Would you like to download it from GitHub?`,
    [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'Update',
        onPress: async () => {
          try {
            await Linking.openURL(releaseUrl);
          } catch (error) {
            console.error('Failed to open update URL:', error);
          }
        },
      },
    ]
  );
}

export async function autoCheckForUpdates(): Promise<void> {
  const result = await checkForGitHubUpdate();
  if (result.hasUpdate && result.releaseUrl && result.latestVersion) {
    const lastNotified = await AsyncStorage.getItem(LAST_NOTIFIED_RELEASE_KEY);
    if (lastNotified !== result.latestVersion) {
      await sendReleaseNotification(result.latestVersion, result.releaseUrl);
      await AsyncStorage.setItem(LAST_NOTIFIED_RELEASE_KEY, result.latestVersion);
    }
    await promptForUpdate(result.releaseUrl, result.latestVersion);
  }
}

export async function manualCheckForUpdates(): Promise<{
  status: 'updated' | 'available' | 'error';
  currentVersion: string;
  latestVersion?: string;
}> {
  const current = getCurrentVersion();
  try {
    const result = await checkForGitHubUpdate();
    if (result.hasUpdate && result.releaseUrl && result.latestVersion) {
      const lastNotified = await AsyncStorage.getItem(LAST_NOTIFIED_RELEASE_KEY);
      if (lastNotified !== result.latestVersion) {
        await sendReleaseNotification(result.latestVersion, result.releaseUrl);
        await AsyncStorage.setItem(LAST_NOTIFIED_RELEASE_KEY, result.latestVersion);
      }
      await promptForUpdate(result.releaseUrl, result.latestVersion);
      return { status: 'available', currentVersion: current, latestVersion: result.latestVersion };
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`You are running the latest version of Ayara (v${current}).`);
    } else {
      Alert.alert('App is Up to Date', `You are running the latest version of Ayara (v${current}).`);
    }
    return { status: 'updated', currentVersion: current };
  } catch {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('Unable to check for updates. Please verify your internet connection.');
    } else {
      Alert.alert('Check Failed', 'Unable to check for updates. Please verify your internet connection.');
    }
    return { status: 'error', currentVersion: current };
  }
}
