import React, { createContext, useState, useContext } from 'react';

// Define the 5 specific roles for the IntelliStock system
export const ROLES = {
  MANAGER: 'Warehouse Manager',
  REQUESTER: 'Requesting Entity',
  SUPPLIER: 'Supplier',
  ADMIN: 'Administrator',
  STAFF: 'Warehouse Staff'
};

const RoleContext = createContext();

export function RoleProvider({ children }) {
  // Default to Requesting Entity for this demo
  const [currentRole, setCurrentRole] = useState(ROLES.REQUESTER);

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, ROLES }}>
      {children}
    </RoleContext.Provider>
  );
}

// Custom hook to easily grab the role in any component
export const useRole = () => useContext(RoleContext);