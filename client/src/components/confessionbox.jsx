import React, { useState } from 'react';
import './ConfessionBox.css';

function ConfessionBox({ question, onSubmit }) {
  const [text, setText] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() || isTransmitting) return;

    setIsTransmitting(true);
    const success = await onSubmit(text);
    
    if (success) {
      setText('');
    }
    
    setIsTransmitting(false);
  };

  return (
    
      
        DATA TRANSMISSION PROTOCOL
        
          
          
          
        
      
      
      
        > {question}
      
      
      
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="INPUT DATA HERE..."
          className="confession-input"
          disabled={isTransmitting}
        />
        
        
          
            {isTransmitting ? 'TRANSMITTING...' : 'TRANSMIT'}
          
          
        
      
    
  );
}

export default ConfessionBox;