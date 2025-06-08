"use client";
import { useState, ReactElement } from "react";

interface AnnouncementScrollContainerProps {
  announcementElements: ReactElement[];
  totalAnnouncements: number;
}

const AnnouncementScrollContainer = ({ announcementElements, totalAnnouncements }: AnnouncementScrollContainerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;
  
  const handleScrollUp = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleScrollDown = () => {
    if (currentIndex + visibleCount < totalAnnouncements) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="flex items-start gap-2">
      {/* Announcements Container */}
      <div className="flex-1 h-[400px] overflow-hidden">
        <div 
          className="flex flex-col gap-4 transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateY(-${currentIndex * 136}px)` // 120px height + 16px gap
          }}
        >
          {announcementElements}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      {totalAnnouncements > visibleCount && (
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
            disabled={currentIndex + visibleCount >= totalAnnouncements}
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

export default AnnouncementScrollContainer;
