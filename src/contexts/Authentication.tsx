import { SiweMessage } from "siwe";
import type { Address, Connector } from "wagmi";

import {
  readContract,
  writeContract,
  prepareWriteContract,
} from "wagmi/actions";
import { polygon, polygonMumbai } from "wagmi/chains";

import {
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  type ReactNode,
} from "react";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import { useAccount, useSignMessage, useConnect, useDisconnect } from "wagmi";
import { useAppStates } from "./AppStates";
import useAddressMismatch from "~/hooks/common/useAddressMismatch";

import { log } from "next-axiom";

export interface IAuthenticationContext {
  isConnected: boolean;
  isConnecting: boolean;
  connectors: Connector<any, any, any>[];
  activeConnector: Connector<any, any, any> | undefined;

  login: ((connector: Connector) => Promise<void>) | undefined;
  logout: (() => Promise<void>) | undefined;
}

export const AuthenticationContext = createContext<IAuthenticationContext>({
  isConnected: false,
  isConnecting: false,
  connectors: [],
  activeConnector: undefined,

  login: undefined,
  logout: undefined,
});

export const useAuthentication = (): IAuthenticationContext => {
  return useContext(AuthenticationContext);
};

const AuthenticationProvider = ({
  children,
}: //   session,
{
  children: ReactNode;
  //   session: Session | null;
}) => {
  const { setIsConnectOptionsOpened, setIsDeployingAccount } = useAppStates();
  //   const { setIsPingLogoutSessionExpiry } = useNotifications();
  const addressAppDeploy = "0x8c5dCA45b16E0c73b5bE0fc877E7d9Fda70d40b5";
  const { data, status } = useSession(); // from data, can get id (address) from server side

  const {
    address: addressWallet,
    connector: activeConnector,
    isConnected: isAddressConnected,
    isConnecting: isAddressConnecting,
    isReconnecting: isAddressReconnecting,
  } = useAccount({
    // eslint-disable-next-line
    onDisconnect: async () => {
      await logout();
    },
  });

  const { signMessageAsync } = useSignMessage();

  const authIn = async (address: Address, chainId: number) => {
    try {
      const message = new SiweMessage({
        version: "1",
        address: address,
        chainId: chainId,
        nonce: await getCsrfToken(),
        statement: "Sign In With Ethereum.",
        domain: window.location.host,
        uri: window.location.origin,
      });
      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({
        message: preparedMessage,
      });
      await signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        // callbackUrl,
      });
      log.info("authIn - success");
    } catch (error) {
      console.error("Failed to auth in");
      console.error(error);
      log.info("authIn - failure");
    }
  };

  const authOut = async () => {
    if (status === "unauthenticated") return;
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Failed to auth out");
      console.error(error);
    }
  };

  const [isProcessingLogin, setIsProcessingLogin] = useState<boolean>(false);
  const { connectAsync, connectors } = useConnect({
    onSuccess: async (data) => {
      setIsProcessingLogin(true);

      const isDeployed = await readContract({
        address: addressAppDeploy,
        abi: ["function isDeployed(address _user) public view returns (bool)"],
        functionName: "isDeployed",
        args: [data.account],
      });

      if (!isDeployed) {
        try {
          const config = await prepareWriteContract({
            address: addressAppDeploy,
            abi: ["function deploy() external"],
            functionName: "deploy",
          });
          const { wait } = await writeContract(config);
          setIsDeployingAccount(true);
          await wait();
          console.warn("ACCOUNT DEPLOYED");
          log.info("deploy account - success");

          await authIn(data.account, data.chain.id);
        } catch (error) {
          console.error(error);
          log.error("deploy account - failure");
        }
      } else {
        await authIn(data.account, data.chain.id);
      }

      console.log("SIGNIN COMPLETE");
      setIsConnectOptionsOpened(false);
      setIsDeployingAccount(false);
      setIsProcessingLogin(false);
    },
  });
  const { disconnectAsync } = useDisconnect({
    onSuccess: async () => {
      await authOut();
      console.log("SIGNOUT COMPLETE");
    },
  });

  const login = async (connector: Connector) => {
    if (addressAppDeploy === undefined) return;
    try {
      await connectAsync({ connector });
    } catch (error) {
      console.error(error);
    }
  };
  const logout = useCallback(async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      console.error(error);
    }
  }, [disconnectAsync]);

  const isConnecting =
    isAddressConnecting ||
    isAddressReconnecting ||
    status === "loading" ||
    isProcessingLogin ||
    addressAppDeploy === undefined;
  const isConnected = isAddressConnected && status === "authenticated";

  //   useAddressMismatch({ callback: logout });

  const contextProvider = {
    isConnected,
    isConnecting,
    connectors,
    activeConnector,
    login,
    logout,
  };

  return (
    <AuthenticationContext.Provider value={contextProvider}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationProvider;
