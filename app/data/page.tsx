'use client';

import React, { useState } from 'react';
import useFirebase from '@/hooks/useFirebase';

export default function Test() {
  const { dataSet } = useFirebase()
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    // dataSet('test-key', inputValue);
  };

  return (
    <div>
      <input type="text" value={inputValue} onChange={handleInputChange} className='border' />
      <button onClick={handleButtonClick}>Send</button>
    </div>
  );
};