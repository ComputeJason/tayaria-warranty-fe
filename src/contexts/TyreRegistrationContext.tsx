
import React, { createContext, useState, ReactNode } from 'react';

// Define the registration type
interface TyreRegistration {
  id: string;
  pattern: string;
  size: string;
  date: string;
  serialNumber: string;
  retailer?: string;
  purchaseDate?: string;
}

// Mock initial data for registrations
const initialRegistrations: TyreRegistration[] = [
  {
    id: 'REG-001',
    pattern: 'Tayaria All-Terrain Pro',
    size: '255/60R18',
    date: '10 Apr 2025',
    serialNumber: 'TAY-23456789'
  },
  {
    id: 'REG-002',
    pattern: 'Tayaria Highway Comfort',
    size: '195/65R15',
    date: '02 Apr 2025',
    serialNumber: 'TAY-34567890'
  },
  {
    id: 'REG-003',
    pattern: 'Tayaria Mud Tracker',
    size: '265/70R16',
    date: '25 Mar 2025',
    serialNumber: 'TAY-45678901'
  }
];

// Define the context type
interface TyreRegistrationContextType {
  registrations: TyreRegistration[];
  addRegistration: (registration: TyreRegistration) => void;
}

// Create the context
export const TyreRegistrationContext = createContext<TyreRegistrationContextType>({
  registrations: initialRegistrations,
  addRegistration: () => {},
});

// Create context provider component
export const TyreRegistrationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [registrations, setRegistrations] = useState<TyreRegistration[]>(initialRegistrations);

  const addRegistration = (registration: TyreRegistration) => {
    setRegistrations([registration, ...registrations]);
  };

  return (
    <TyreRegistrationContext.Provider value={{ registrations, addRegistration }}>
      {children}
    </TyreRegistrationContext.Provider>
  );
};
