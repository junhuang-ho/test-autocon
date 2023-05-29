import type { Dispatch, SetStateAction } from "react";

import { createContext, useContext, useState } from "react";

export interface IAppStatesContext {
  isConnectOptionsOpened: boolean;
  isDeployingAccount: boolean;
  setIsConnectOptionsOpened: Dispatch<SetStateAction<boolean>>;
  setIsDeployingAccount: Dispatch<SetStateAction<boolean>>;
}

export const AppStatesContext = createContext<IAppStatesContext>({
  isConnectOptionsOpened: false,
  isDeployingAccount: false,
  setIsConnectOptionsOpened: () => {},
  setIsDeployingAccount: () => {},
});

export const useAppStates = (): IAppStatesContext => {
  return useContext(AppStatesContext);
};

const AppStatesProvider = ({ children }: { children: JSX.Element }) => {
  const [isConnectOptionsOpened, setIsConnectOptionsOpened] =
    useState<boolean>(false);
  const [isDeployingAccount, setIsDeployingAccount] = useState<boolean>(false);

  const contextProvider = {
    isConnectOptionsOpened,
    isDeployingAccount,
    setIsConnectOptionsOpened,
    setIsDeployingAccount,
  };
  return (
    <AppStatesContext.Provider value={contextProvider}>
      {children}
    </AppStatesContext.Provider>
  );
};

export default AppStatesProvider;
