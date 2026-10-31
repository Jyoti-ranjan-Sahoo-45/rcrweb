import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

export const NeedHelpWidget = () => {
  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40">
      <Link
        to="/contact-us"
        className="group relative flex items-center justify-center w-13 h-13 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Raise Support Ticket"
        title="Raise Support Ticket"
      >
        <Ticket size={22} className="text-white" />
      </Link>
    </div>
  );
};
