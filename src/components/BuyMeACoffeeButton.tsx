import React from 'react';

const BuyMeACoffeeButton: React.FC = () => {
  return (
    <a
      href="https://buymeacoffee.com/harrisonknoll"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl flex items-center gap-2 text-sm"
      aria-label="Buy me a coffee"
    >
      <span>☕</span>
      <span className="hidden sm:inline">Buy Me A Coffee</span>
      <span className="sm:hidden">Coffee</span>
    </a>
  );
};

export default BuyMeACoffeeButton; 