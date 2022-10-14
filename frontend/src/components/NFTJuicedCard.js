import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { mutNftFromBootcamp, nftToMutable } from "../contexts/bootcamp_helper";
import { ClipLoader } from "react-spinners";
// import nftList from "../contexts/old_to_new.json";

export default function NFTJuicedCard({
  image,
  title,
  mutable,
  address,
  nftList,
  stake,
}) {
  const wallet = useWallet();

  const [loading, setLoading] = useState(false);
  const [nftTitle, setNftTitle] = useState(title);
  const [mutableImage, setMutableImage] = useState(image);
  const [changeMutable, setChangeMutable] = useState(mutable);

  const setImage = () => {
    let i;
    for (i = 0; i < nftList.length; i++) {
      if (nftList[i].oldaddress === address) {
        break;
      }
    }
  };

  const mutableNft = async () => {
    if (stake) {
      await mutNftFromBootcamp(
        wallet,
        new PublicKey(address),
        () => setLoading(true),
        () => setLoading(false),
        () => updatePage()
      );
    } else {
      await nftToMutable(wallet, new PublicKey(address), () => updatePage());
    }
  };

  const updatePage = () => {
    setChangeMutable(1);
  };
  useEffect(() => {}, [changeMutable, wallet.connected, wallet.publicKey]);
  return (
    <div className="juiced-card" onClick={setImage}>
      <img src={mutableImage} alt="" />
      <h2>{nftTitle}</h2>
      {changeMutable ? (
        <>
          <div className="sub-title">
            <h3>Current status:</h3>
            <p className="select-mutable">Mutable</p>
          </div>
          <h3>Congratulations, yor NFT is mutated!</h3>
          <div className="mutable-btn">Mutated</div>
        </>
      ) : (
        <>
          <div className="sub-title">
            <h3>Current status:</h3>
            <p className="non-select-mutable">Non-mutable</p>
          </div>
          <h3>Ready to be mutable</h3>
          <button
            className="non-mutable-btn"
            onClick={mutableNft}
            disabled={loading}
          >
            {!loading ? (
              <span>Make it mutable</span>
            ) : (
              <ClipLoader color="#FFF" size={20} />
            )}
          </button>
        </>
      )}
    </div>
  );
}
