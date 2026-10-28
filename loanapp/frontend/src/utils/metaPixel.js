/**
 * Meta Pixel helper utility for standard and custom tracking events
 * Pixel ID: 1792100208524597
 */

export const trackMetaEvent = (eventName, params = {}, eventId = null) => {
  if (typeof window !== 'undefined' && window.fbq) {
    if (eventId) {
      window.fbq('track', eventName, params, { eventID: eventId });
    } else {
      window.fbq('track', eventName, params);
    }
  }
};

export const trackCustomMetaEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
};
