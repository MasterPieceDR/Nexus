import { useState, useEffect, useRef } from 'react';
import PinCard from './PinCard';

export default function MasonryGrid({ pins, onPinClick, onUpdatePin }) {
  const [columns, setColumns] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateColumns = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width >= 1536) setColumns(6);
        else if (width >= 1280) setColumns(5);
        else if (width >= 1024) setColumns(4);
        else if (width >= 768) setColumns(3);
        else if (width >= 640) setColumns(2);
        else setColumns(2);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const columnWrappers = Array.from({ length: columns }, () => []);
  
  pins.forEach((pin, i) => {
    columnWrappers[i % columns].push(pin);
  });

  return (
    <div ref={containerRef} className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-4 sm:gap-6 justify-center">
        {columnWrappers.map((column, i) => (
          <div key={i} className="flex flex-col gap-4 sm:gap-6 flex-1 max-w-[300px]">
            {column.map((pin) => (
              <PinCard 
                key={pin.id} 
                pin={pin} 
                onClick={() => onPinClick && onPinClick(pin)}
                onUpdatePin={onUpdatePin}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
