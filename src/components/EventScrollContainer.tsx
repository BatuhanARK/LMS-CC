"use client";
import { useState, ReactElement } from "react";

interface EventScrollContainerProps {
  eventElements: ReactElement[];
  totalEvents: number;
}

const EventScrollContainer = ({ eventElements, totalEvents }: EventScrollContainerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;
  
  const handleScrollUp = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleScrollDown = () => {
    if (currentIndex + visibleCount < totalEvents) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Event yoksa özel mesaj göster
  if (totalEvents === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No events scheduled for today.
      </div>
    );
  }

  // Dinamik yükseklik hesapb
  const visibleEventCount = Math.min(totalEvents, visibleCount);
  const containerHeight = visibleEventCount * 130 + (visibleEventCount - 1) * 16; // 130px event + 16px gap

  return (
    <div className="flex items-start gap-2">
      {/* Events Container */}
      <div 
        className="flex-1 overflow-hidden"
        style={{ height: `${containerHeight}px` }} // Dinamik yükseklik
      >
        <div 
          className="flex flex-col gap-4 transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateY(-${currentIndex * 146}px)` // 130px height + 16px gap
          }}
        >
          {eventElements}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      {totalEvents > visibleCount && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleScrollUp}
            disabled={currentIndex === 0}
            className="p-2 rounded-md border-2 border-gray-100 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg 
              className="w-4 h-4 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <button
            onClick={handleScrollDown}
            disabled={currentIndex + visibleCount >= totalEvents}
            className="p-2 rounded-md border-2 border-gray-100 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg 
              className="w-4 h-4 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default EventScrollContainer;
