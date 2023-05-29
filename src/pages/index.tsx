import { type NextPage } from "next";

import { useAccount } from "wagmi";

const Home: NextPage = () => {
  const { address } = useAccount();
  return (
    <div>
      <div>{address}</div>
    </div>
  );
};

export default Home;
