import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const GITHUB_REPO = 'arafatmollah/Ayara'; // Update if different

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
    await promptForUpdate(result.releaseUrl, result.latestVersion);
  }
}
