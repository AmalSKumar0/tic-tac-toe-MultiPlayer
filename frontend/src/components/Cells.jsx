// src/components/Cell.jsx

import React from 'react';

function Cell({ value, onClick }) {
  const className = `cell cell-${value ? value.toLowerCase() : 'empty'}`;
  
  return (
    <div className={className} onClick={onClick}>
      {/* We can render the value directly, but the CSS will handle the X/O images */}
    </div>
  );
}

export default Cell;