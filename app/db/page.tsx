'use client';

import React, { useState } from 'react';
import { useFirebaseSet } from '@/hooks/useFirebaseSet';

const TestPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    useFirebaseSet('test-key', inputValue);
  };

  return (
    <div>
      <input type="text" value={inputValue} onChange={handleInputChange} className='border' />
      <button onClick={handleButtonClick}>Send</button>
    </div>
  );
};

export default TestPage;