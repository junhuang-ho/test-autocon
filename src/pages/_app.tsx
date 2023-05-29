import "~/styles/globals.css";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon, polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import {
  TwitterSocialWalletConnector,
  GoogleSocialWalletConnector,
  TwitchSocialWalletConnector,
  DiscordSocialWalletConnector,
  FacebookSocialWalletConnector,
} from "@zerodevapp/wagmi";

import { env } from "~/env.mjs";

import Hydration from "~/components/layouts/Hydration";
import MainLayout from "~/components/layouts/MainLayout";
import AuthenticationProvider from "~/contexts/Authentication";
import AppStatesProvider from "~/contexts/AppStates";

import { log } from "next-axiom";
if (process.env.NODE_ENV !== "production") log.logLevel = "off";

export { reportWebVitals } from "next-axiom";

const ZERODEV_PROJECT_ID = env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;

const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [
    alchemyProvider({
      apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY_CLIENT,
    }),
    publicProvider(),
  ]
);

const connectorTwitter = new TwitterSocialWalletConnector({
  chains,
  options: {
    projectId: ZERODEV_PROJECT_ID,
    shimDisconnect: true,
  },
}); // defining it here = no autoconnect
const connectorGoogle = new GoogleSocialWalletConnector({
  chains,
  options: {
    projectId: ZERODEV_PROJECT_ID,
    shimDisconnect: true,
  },
});
// const connectorTwitter = new TwitterSocialWalletConnector({
//   chains,
//   options: {
//     projectId: ZERODEV_PROJECT_ID,
//     shimDisconnect: true,
//   },
// }); // defining it here = autoconnect success

const wagmiConfig = createClient({
  autoConnect: true,
  connectors: [connectorTwitter, connectorGoogle], // connectorTwitter
  provider,
  webSocketProvider,
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <Hydration>
      <WagmiConfig client={wagmiConfig}>
        <SessionProvider
          session={session}
          refetchInterval={60 * 60 * 24 * 7 - 60 * 60}
          refetchOnWindowFocus={true}
        >
          <AppStatesProvider>
            <AuthenticationProvider>
              <MainLayout>
                <Component {...pageProps} />
              </MainLayout>
            </AuthenticationProvider>
          </AppStatesProvider>
        </SessionProvider>
      </WagmiConfig>
    </Hydration>
  );
};

export default api.withTRPC(MyApp);
