// src/components/FloatingIcons.jsx

import React, { useEffect, useRef } from 'react';

// An array to define the initial icons
const initialIcons = ['x', 'o', 'x', 'o', 'x', 'o'];

function FloatingIcons() {
  const iconsRef = useRef([]);
  const animationFrameId = useRef();

  useEffect(() => {
    const iconData = [];
    
    // Initialize properties for each icon
    iconsRef.current.forEach(iconEl => {
      if (!iconEl) return;
      const iconSize = iconEl.getBoundingClientRect().width;
      iconData.push({
        element: iconEl,
        x: Math.random() * (window.innerWidth - iconSize),
        y: Math.random() * (window.innerHeight - iconSize),
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        dRotation: (Math.random() - 0.5) * 0.5,
      });
    });

    const animate = () => {
      iconData.forEach(data => {
        const { element } = data;
        const iconSize = element.getBoundingClientRect().width;

        data.x += data.dx;
        data.y += data.dy;
        data.rotation += data.dRotation;

        if (data.x <= 0 || data.x >= window.innerWidth - iconSize) data.dx *= -1;
        if (data.y <= 0 || data.y >= window.innerHeight - iconSize) data.dy *= -1;

        element.style.transform = `translate(${data.x}px, ${data.y}px) rotate(${data.rotation}deg)`;
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function to stop the animation when the component unmounts
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="floating-icons-container">
      {initialIcons.map((type, index) => (
        <div
          key={index}
          className={`float-icon cell-${type}`}
          ref={el => iconsRef.current[index] = el}
        />
      ))}
    </div>
  );
}

export default FloatingIcons;