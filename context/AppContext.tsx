import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type AppContextType = {
  isProfileDrawerOpen: boolean;
  isMessagesDrawerOpen: boolean;
  isNotificationsDrawerOpen: boolean;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
  openMessagesDrawer: () => void;
  closeMessagesDrawer: () => void;
  openNotificationsDrawer: () => void;
  closeNotificationsDrawer: () => void;
};

const AppContext = createContext<AppContextType>({
  isProfileDrawerOpen: false,
  isMessagesDrawerOpen: false,
  isNotificationsDrawerOpen: false,
  openProfileDrawer: () => {},
  closeProfileDrawer: () => {},
  openMessagesDrawer: () => {},
  closeMessagesDrawer: () => {},
  openNotificationsDrawer: () => {},
  closeNotificationsDrawer: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isMessagesDrawerOpen, setIsMessagesDrawerOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  
  const openProfileDrawer = useCallback(() => {
    setIsMessagesDrawerOpen(false);
    setIsNotificationsDrawerOpen(false);
    setIsProfileDrawerOpen(true);
  }, []);
  
  const closeProfileDrawer = useCallback(() => {
    setIsProfileDrawerOpen(false);
  }, []);
  
  const openMessagesDrawer = useCallback(() => {
    setIsProfileDrawerOpen(false);
    setIsNotificationsDrawerOpen(false);
    setIsMessagesDrawerOpen(true);
  }, []);
  
  const closeMessagesDrawer = useCallback(() => {
    setIsMessagesDrawerOpen(false);
  }, []);
  
  const openNotificationsDrawer = useCallback(() => {
    setIsProfileDrawerOpen(false);
    setIsMessagesDrawerOpen(false);
    setIsNotificationsDrawerOpen(true);
  }, []);
  
  const closeNotificationsDrawer = useCallback(() => {
    setIsNotificationsDrawerOpen(false);
  }, []);
  
  return (
    <AppContext.Provider
      value={{
        isProfileDrawerOpen,
        isMessagesDrawerOpen,
        isNotificationsDrawerOpen,
        openProfileDrawer,
        closeProfileDrawer,
        openMessagesDrawer,
        closeMessagesDrawer,
        openNotificationsDrawer,
        closeNotificationsDrawer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);