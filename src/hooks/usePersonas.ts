import { useState } from 'react';

const usePersonas = () => {
  const [personas, setPersonas] = useState([
    { _id: '1', name: 'Professional Alex' },
    { _id: '2', name: 'Casual Casey' },
  ]);

  const getDefaultPersona = () => {
    // Select first persona as default for simplicity
    return personas[0];
  };

  return { personas, getDefaultPersona };
};

export default usePersonas;
