import React, { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatWidget({ isOpen, onToggle }: ChatWidgetProps) {
  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 bg-brand text-white w-14 h-14 rounded-full shadow-lg hover:bg-brand-light transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
          aria-label="Open chat support"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Chat Header */}
          <div className="bg-brand text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold text-lg">Customer Support</h3>
            <div className="flex gap-2">
              <button
                onClick={onToggle}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggle}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content - This will be handled by parent component */}
          <div className="flex-1 p-4">
            {/* Chat messages will go here */}
            <div className="text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Chat functionality coming soon!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}