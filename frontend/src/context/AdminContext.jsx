import { createContext, useContext, useMemo, useState } from 'react';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const value = useMemo(() => ({ orders, setOrders }), [orders]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);
