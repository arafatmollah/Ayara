import { router } from 'expo-router';

// Screens opened directly (deep link, notification, web refresh) have no history to pop.
export function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}
