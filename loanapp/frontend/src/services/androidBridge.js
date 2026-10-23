/**
 * Native Android Bridge interface handler
 * Bridges between the React customer web app and Kotlin Android native shell
 */

export const isNativeApp = () => {
  return typeof window !== 'undefined' && Boolean(window.AndroidBridge);
};

export const getDeviceInfo = () => {
  if (isNativeApp() && typeof window.AndroidBridge.getDeviceInfo === 'function') {
    try {
      return JSON.parse(window.AndroidBridge.getDeviceInfo());
    } catch (e) {
      console.warn('Failed to parse Android deviceInfo', e);
    }
  }
  return { isNative: false, userAgent: navigator.userAgent };
};

export const showNativeToast = (message) => {
  if (isNativeApp() && typeof window.AndroidBridge.showToast === 'function') {
    window.AndroidBridge.showToast(message);
    return true;
  }
  return false;
};

export const triggerNativeDownload = (url, filename) => {
  if (isNativeApp() && typeof window.AndroidBridge.downloadFile === 'function') {
    window.AndroidBridge.downloadFile(url, filename);
    return true;
  }
  // Fallback to web download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'document';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return false;
};
