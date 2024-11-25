import React from "react";
import styles from "./index.module.scss";

interface WalletButtonProps {
  walletImage: string;
  walletName: string;
  onClick: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({
  walletImage,
  walletName,
  onClick,
}) => {
  return (
    <button className={styles.walletLogoButton} onClick={onClick}>
      <img src={walletImage} />
      <div>{walletName}</div>
    </button>
  );
};

export default WalletButton;
