import React from 'react';

export const NeedHelpWidget = () => {
  const whatsappUrl = 'https://wa.me/919588746801?text=Hello%20RCR%20Finance%2C%20I%20need%20assistance%20with%20my%20loan%20application.';

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-[0_6px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
      >
        {/* Pulsing online ring badge */}
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-white"></span>
        </span>

        {/* Official WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 32 32"
          className="w-8 h-8 fill-white transition-transform group-hover:scale-105"
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.72.78 5.26 2.12 7.42L2.5 30l6.76-1.58C11.3 29.44 13.58 30 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.54c-2.18 0-4.22-.6-5.98-1.64l-.42-.26-4.42 1.04 1.04-4.3-.28-.44C4.84 20.18 4.24 18.16 4.24 16c0-6.48 5.28-11.76 11.76-11.76 6.48 0 11.76 5.28 11.76 11.76 0 6.48-5.28 11.76-11.76 11.76zm6.46-8.82c-.36-.18-2.12-1.04-2.44-1.16-.32-.12-.56-.18-.8.18-.24.36-.92 1.16-1.12 1.4-.2.24-.4.26-.76.08-.36-.18-1.52-.56-2.9-1.78-1.08-.96-1.8-2.14-2.02-2.5-.2-.36-.02-.56.16-.74.16-.16.36-.4.54-.6.18-.2.24-.36.36-.6.12-.24.06-.44-.04-.62-.1-.18-.8-1.92-1.1-2.64-.3-.7-.58-.6-.8-.62h-.68c-.24 0-.62.08-.94.44-.32.36-1.24 1.22-1.24 2.96 0 1.74 1.28 3.44 1.46 3.68.18.24 2.5 3.82 6.06 5.36.84.36 1.5.58 2.02.74.86.28 1.64.24 2.26.14.68-.1 2.12-.86 2.42-1.7.3-.84.3-1.56.22-1.7-.1-.16-.34-.24-.7-.42z" />
        </svg>
      </a>
    </div>
  );
};
