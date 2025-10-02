import React from 'react';
import './TicketAnimation.css';

function TicketAnimation({ count }) {
  return (
    
      {[...Array(count)].map((_, index) => (
        
          
          
            ARCADE TICKET
            1
            
              #{Math.random().toString(36).substr(2, 9).toUpperCase()}
            
          
          
        
      ))}
      
      
        +{count} TICKET{count > 1 ? 'S' : ''} EARNED
      
    
  );
}

export default TicketAnimation;