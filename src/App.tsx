import ChainRow from "./components/ChainRow";
import React from "react";
import chains from "./constants/chains";
import styles from "./App.module.scss";

const App: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Make a Donation</h2>
      <div className={styles.body}>
        {chains.map((chain) => {
          return <ChainRow key={chain.chainId} chain={chain} />;
        })}
      </div>
    </div>
  );
};

export default App;
