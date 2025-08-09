import React, { useState, useRef, useEffect } from 'react';

interface BottomSheetProps {
  children: React.ReactNode;
  onClose: () => void;
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
}

export function BottomSheet({
  children,
  onClose,
  minHeight = 300,
  maxHeight = 600,
  defaultHeight = 400,
}: BottomSheetProps) {
  const [height, setHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = dragStartY.current - e.clientY;
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, dragStartHeight.current + deltaY)
      );
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minHeight, maxHeight]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700 rounded-t-xl"
        style={{ height: `${height}px` }}
      >
        {/* Drag Handle */}
        <div
          className="w-full h-6 flex items-center justify-center cursor-ns-resize bg-gray-50 dark:bg-gray-800 rounded-t-xl"
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Content */}
        <div className="h-full pb-6 overflow-hidden">{children}</div>
      </div>
    </>
  );
}
