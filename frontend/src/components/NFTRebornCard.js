import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
// import { mutNftFromStaking } from "../contexts/helper";
import { mutNftFromBootcamp, rebirthNft } from "../contexts/juicing_helper";
// import nftList from "../contexts/old_to_new.json";

export default function NFTRebornCard({
  image,
  title,
  mutable,
  address,
  newMetaLink,
  rebirthMetaLink,
  // nftList,
  stake,
  bootcamp,
}) {
  const wallet = useWallet();

  const [loading, setLoading] = useState(false);
  const [nftTitle, setNftTitle] = useState(title);
  const [mutableImage, setMutableImage] = useState(image);
  const [upgraded, setUpgraded] = useState(mutable);

  const setImage = () => {
    // let i;
    // for (i = 0; i < nftList.length; i++) {
    //   if (nftList[i].oldaddress === address) {
    //     break;
    //   }
    // }
  };

  const mutableNft = async () => {
    console.log("Request rebirth --->", address, newMetaLink, rebirthMetaLink);
    if (!rebirthMetaLink) return;
    // if (stake) {
    //   await mutNftFromStaking(
    //     wallet,
    //     new PublicKey(address),
    //     () => setLoading(true),
    //     () => setLoading(false),
    //     () => updatePage()
    //   );
    // } else if (bootcamp) {
    //   await mutNftFromBootcamp(
    //     wallet,
    //     new PublicKey(address),
    //     () => setLoading(true),
    //     () => setLoading(false),
    //     () => updatePage()
    //   );
    // } else {
    await rebirthNft(
      wallet,
      new PublicKey(address),
      newMetaLink,
      rebirthMetaLink,
      () => setLoading(true),
      () => setLoading(false),
      () => updatePage()
    );
    // }
  };

  const updatePage = () => {
    setUpgraded(1);
  };
  useEffect(() => {}, [upgraded, wallet.connected, wallet.publicKey]);

  return (
    <div className="juiced-card" onClick={setImage}>
      <img src={mutableImage} alt="" />
      <h2>{nftTitle}</h2>
      {upgraded ? (
        <>
          <div className="sub-title">
            <h3>Current status:</h3>
            <p className="select-mutable">Upgraded</p>
          </div>
          <h3>Congratulations, yor NFT is reborn!</h3>
          <div className="mutable-btn">Upgraded</div>
        </>
      ) : (
        <>
          <div className="sub-title">
            <h3>Current status:</h3>
            <p className="non-select-mutable">Genesis</p>
          </div>
          <h3>Ready to be reborn</h3>
          <button
            className="non-mutable-btn"
            onClick={mutableNft}
            disabled={loading}
          >
            {!loading ? (
              <span>Upgrade it</span>
            ) : (
              <ClipLoader color="#FFF" size={20} />
            )}
          </button>
        </>
      )}
    </div>
  );
}
