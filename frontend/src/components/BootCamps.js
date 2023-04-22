import crossImage from "../assets/img/cross.png";
import mmaImage from "../assets/img/mma.png";
import militaryImage from "../assets/img/military.png";
import { PrimaryButton } from "./styleHook";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function BootCamps({
  forceRender,
  bootCampIndex,
  setBootCampIndex,
  ...props
}) {
  const wallet = useWallet();

  useEffect(() => {
    if (!wallet.publicKey) setBootCampIndex(0);
    // eslint-disable-next-line
  }, [wallet.publicKey, wallet.connected]);

  const onSelected = (idx) => {
    if (wallet.publicKey) {
      setBootCampIndex(idx);
    }
  };

  return (
    <div className="bootcamp-select-container">
      <div className={`bootcamp-select-content`}>
        <h3>Tier 1</h3>
        <h3>CrossFit bootcamp</h3>
        <div className="bootcamp-select-img">
          <img src={crossImage} style={{ top: "-10%" }} alt="" />
        </div>
        <p>
          Staking vault that earns 1.5x more $WHEY per Ape.
          <br />
          It costs <span>750 $WHEY</span> to stake 1 Ape in Tier 1 Vault
        </p>
        <div className="bootcamp-select-btn">
          <PrimaryButton
            className={""}
            style={{ maxWidth: "" }}
            disabled={false}
            onClick={() => {
              onSelected(1);
            }}
          >
            Select
          </PrimaryButton>
        </div>
      </div>
      <div className={`bootcamp-select-content second`}>
        <h3>Tier 2</h3>
        <h3>MMA bootcamp</h3>
        <div className="bootcamp-select-img">
          <img
            src={mmaImage}
            style={{
              bottom: "0%",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            alt=""
          />
        </div>
        <p>
          Staking vault that earns 1.75x more $WHEY per Ape.
          <br />
          It costs <span>1125 $WHEY</span> to stake 1 Ape in Tier 2 Vault
        </p>
        <div className="bootcamp-select-btn">
          <PrimaryButton
            className={""}
            style={{ maxWidth: "" }}
            disabled={false}
            onClick={() => {
              onSelected(2);
            }}
          >
            Select
          </PrimaryButton>
        </div>
      </div>
      <div className={`bootcamp-select-content third`}>
        <h3>Tier 3</h3>
        <h3>Military bootcamp</h3>
        <div className="bootcamp-select-img">
          <img
            src={militaryImage}
            style={{
              top: "-10%",
              left: "100%",
              transform: "translateX(-100%)",
            }}
            alt=""
          />
        </div>
        <p>
          Staking vault that earns 2x more $WHEY per Ape.
          <br />
          It costs <span style={{ color: "white" }}>1500 $WHEY</span> to stake 1
          Ape in Tier 3 Vault
        </p>
        <div className="bootcamp-select-btn">
          <PrimaryButton
            className={""}
            style={{ maxWidth: "" }}
            disabled={false}
            onClick={() => {
              onSelected(3);
            }}
          >
            Select
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
