import { useWallet } from "@solana/wallet-adapter-react";
import bannerImage from "../assets/img/rebirth.jpg";
import Container from "../components/Container";
import NFTRebornCard from "../components/NFTRebornCard";
import RightDoubleArrowIcon from "../assets/icons/rightDoubleArrow";
import { useEffect, useState } from "react";
import { getMyNft } from "../contexts/bootcamp_helper";
import { PublicKey } from "@solana/web3.js";
import nftList from "../contexts/old_to_new.json";
import { MUTABLE_COLLECTION } from "../config";
import Footer from "../components/Footer";
import genesis from "../assets/img/genesis.png";
import reborn from "../assets/img/reborn.png";
import SkeletonCard from "../components/SkeletonCard";
import { allNftToRebirth } from "../contexts/juicing_helper";

export default function Rebirth() {
  // ------------page state-----------
  const wallet = useWallet();

  // const [userStakedNFTs, setUserStakedNFTs] = useState([]);
  // const [userStakedBootCampNFTs, setUserStakedBootCampNFTs] = useState([]);
  // const [userJuicedNFTs, setUserJuicedNFTs] = useState([]);
  // const [userJuicedBootCampNFTs, setUserJuicedBootCampNFTs] = useState([]);
  const [walletNFTs, setWalletNFTs] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  // const [walleMutabletNFTs, setWalletMutableNFTs] = useState([]);

  // const [stakedLoading, setStakedLoading] = useState(false);
  // const [bootcampLoading, setBootCampLoading] = useState(false);
  const [unstakedLoading, setUnStakedLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [_forceRender, setForceRender] = useState(false);

  // const getBootcampNFTs = async () => {
  //   setBootCampLoading(true);
  //   let nftBootCampDump = [];
  //   let nftJuicedDump = [];
  //   const bootcamp_list = await getUserBootCampPoolState(wallet.publicKey);
  //   if (bootcamp_list !== null) {
  //     for (let i = 0; i < bootcamp_list.stakedCount.toNumber(); i++) {
  //       const nft = await getNftMetaData(
  //         new PublicKey(bootcamp_list.stakedMints[i].mint)
  //       );
  //       if (nft.data.data.uri) {
  //         await fetch(nft.data.data.uri)
  //           .then((resp) => resp.json())
  //           .then((json) => {
  //             nftBootCampDump.push({
  //               name: json.name,
  //               image: json.image,
  //               mint: nft.data.mint,
  //               address: bootcamp_list.stakedMints[i].mint.toBase58(),
  //               isUpgraded: 1,
  //               // isUpgraded: nft.data.isUpgraded,
  //               // legendary: legendaryValidatie(json),
  //             });
  //           })
  //           .catch((e) => {
  //             console.log("Error while fetching", nft.mint);
  //             console.log(e);
  //           });
  //       }

  //       for (let j = 0; j < nftList.length; j++) {
  //         if (
  //           nftList[j].oldPubkey ===
  //           bootcamp_list.stakedMints[i].mint.toBase58()
  //         ) {
  //           const newNft = await getNftMetaData(
  //             new PublicKey(nftList[j].newPubkey)
  //           );

  //           if (newNft.data.data.uri) {
  //             await fetch(newNft.data.data.uri)
  //               .then((resp) => resp.json())
  //               .then((json) => {
  //                 nftJuicedDump.push({
  //                   name: json.name,
  //                   image: json.image,
  //                   address: nftList[j].newPubkey,
  //                   oldaddress: bootcamp_list.stakedMints[i].mint.toBase58(),
  //                   // tier: bootcamp_list.stakedMints[i].tier.toNumber(),
  //                   // legendary: legendaryValidatie(json),
  //                 });
  //               })
  //               .catch((e) => {
  //                 console.log("Error while fetching", nft.mint);
  //                 console.log(e);
  //               });
  //           }
  //         }
  //       }
  //     }
  //   }

  //   for (let i = 0; i < nftBootCampDump.length; i++) {
  //     let j;
  //     for (j = 0; j < nftList.length; j++) {
  //       if (nftBootCampDump[i].address === nftList[j].oldPubkey) {
  //         break;
  //       }
  //     }
  //     if (j !== nftList.length) {
  //       nftBootCampDump[i].isUpgraded = 0;
  //     }
  //   }

  //   setUserStakedBootCampNFTs(nftBootCampDump);
  //   setUserJuicedBootCampNFTs(nftJuicedDump);
  //   setBootCampLoading(false);
  // };

  // const getStakedNFTs = async () => {
  //   setStakedLoading(true);
  //   let nftStakedDump = [];
  //   let nftJuicedDump = [];
  //   const staked_list = await getUserPoolState(wallet.publicKey);
  //   if (staked_list !== null) {
  //     for (let i = 0; i < staked_list.stakedCount.toNumber(); i++) {
  //       const nft = await getNftMetaData(
  //         new PublicKey(staked_list.stakedMints[i].mint)
  //       );
  //       if (nft.data.data.uri) {
  //         await fetch(nft.data.data.uri)
  //           .then((resp) => resp.json())
  //           .then((json) => {
  //             nftStakedDump.push({
  //               name: json.name,
  //               image: json.image,
  //               mint: nft.data.mint,
  //               address: staked_list.stakedMints[i].mint.toBase58(),
  //               isUpgraded: 1,
  //             });
  //           })
  //           .catch((e) => {
  //             console.log("Error while fetching", nft.mint);
  //             console.log(e);
  //           });
  //       }

  //       for (let j = 0; j < nftList.length; j++) {
  //         if (
  //           nftList[j].oldPubkey === staked_list.stakedMints[i].mint.toBase58()
  //         ) {
  //           const newNft = await getNftMetaData(
  //             new PublicKey(nftList[j].newPubkey)
  //           );

  //           if (newNft.data.data.uri) {
  //             await fetch(newNft.data.data.uri)
  //               .then((resp) => resp.json())
  //               .then((json) => {
  //                 nftJuicedDump.push({
  //                   name: json.name,
  //                   image: json.image,
  //                   address: nftList[j].newPubkey,
  //                   oldaddress: staked_list.stakedMints[i].mint.toBase58(),
  //                   // tier: staked_list.stakedMints[i].tier.toNumber(),
  //                   // legendary: legendaryValidatie(json),
  //                 });
  //               })
  //               .catch((e) => {
  //                 console.log("Error while fetching", nft.mint);
  //                 console.log(e);
  //               });
  //           }
  //         }
  //       }
  //     }
  //   }

  //   for (let i = 0; i < nftStakedDump.length; i++) {
  //     let j;
  //     for (j = 0; j < nftList.length; j++) {
  //       if (nftStakedDump[i].address === nftList[j].oldPubkey) {
  //         break;
  //       }
  //     }
  //     if (j !== nftList.length) {
  //       nftStakedDump[i].isUpgraded = 0;
  //     }
  //   }

  //   setUserStakedNFTs(nftStakedDump);
  //   setUserJuicedNFTs(nftJuicedDump);
  //   setStakedLoading(false);
  // };

  const rebirthNft = async () => {
    // const stakedNFTs = userStakedNFTs
    //   .filter((nft) => !nft.isUpgraded)
    //   .map((nft) => new PublicKey(nft.address));
    // console.log("stakedNFTs -->", stakedNFTs);
    // if (stakedNFTs.length) {
    //   await mutAllNftFromStaking(
    //     wallet,
    //     stakedNFTs,
    //     () => setLoading(true),
    //     () => setLoading(false),
    //     () => updatePage()
    //   );
    // }

    // const stakedBootcampNFTs = userStakedBootCampNFTs
    //   .filter((nft) => !nft.isUpgraded)
    //   .map((nft) => new PublicKey(nft.address));
    // console.log("stakedBootcampNFTs -->", stakedBootcampNFTs);
    // if (stakedBootcampNFTs.length) {
    //   await mutAllNftFromBootcamp(
    //     wallet,
    //     stakedBootcampNFTs,
    //     () => setLoading(true),
    //     () => setLoading(false),
    //     () => updatePage()
    //   );
    // }

    const unstakedNFTs = selectedNFTs
      .filter((nft) => !nft.isUpgraded)
      .map((nft) => new PublicKey(nft.address));
    console.log("unstaked NFTs -->", unstakedNFTs);
    if (unstakedNFTs.length) {
      await allNftToRebirth(
        wallet,
        unstakedNFTs,
        () => setLoading(true),
        () => setLoading(false),
        () => updatePage()
      );
    }
  };

  const handleCardClicked = (item) => () => {
    if (item.isUpgraded) return;
    setSelectedNFTs((old) => {
      const newSelects = Object.assign(old);
      const idx = newSelects
        .map((select) => select.address)
        .indexOf(item.address);
      if (idx === -1) newSelects.push(item);
      else newSelects.splice(idx, 1);
      return newSelects;
    });
    setForceRender((old) => !old);
  };

  const updatePage = () => {
    console.log("Update >>");
  };

  const getMyNfts = async () => {
    // setWalletMutableNFTs([]);
    setWalletNFTs([]);
    setSelectedNFTs([]);
    setForceRender((old) => !old);
    setUnStakedLoading(true);

    const list = await getMyNft(wallet);
    let userNFTList = [];
    // let nftJuicedDump = [];
    if (list) {
      console.log(list);
      for (let nft of list) {
        if (
          nft.data.creators &&
          nft.data.creators[0]?.address === MUTABLE_COLLECTION
        ) {
          let rebirthMetaLink = undefined;
          let newMetaLink = undefined;
          for (let j = 0; j < nftList.length; j++) {
            if (nftList[j].newPubkey === nft.mint) {
              rebirthMetaLink = nftList[j].rebirthMetaLink;
              newMetaLink = nftList[j].newMetaLink;
              break;
            }
          }

          if (nft.data.uri) {
            await fetch(nft.data.uri)
              .then((resp) => resp.json())
              .then((json) => {
                userNFTList.push({
                  name: json.name,
                  image: json.image,
                  address: nft.mint,
                  isUpgraded:
                    rebirthMetaLink && rebirthMetaLink === nft.data.uri,
                  newMetaLink,
                  rebirthMetaLink,
                  // legendary: legendaryValidatie(json),
                });
                console.log("->", userNFTList.length);
                setWalletNFTs(userNFTList);
                setForceRender((old) => !old);
              })
              .catch((e) => {
                console.log("Error while fetching", nft.mint);
                console.log(e);
              });
          }
        }
      }

      console.log(userNFTList);
      // console.log(nftJuicedDump);
      // setWalletMutableNFTs(nftJuicedDump);
      setWalletNFTs(userNFTList);
    }
    setUnStakedLoading(false);
  };

  // const getTest = async () => {};

  useEffect(() => {
    if (!wallet.publicKey) {
      setWalletNFTs([]);
      setSelectedNFTs([]);
      // setWalletMutableNFTs([]);
      // setUserStakedNFTs([]);
      // setUserStakedBootCampNFTs([]);
      // setUserJuicedNFTs([]);
      // setUserJuicedBootCampNFTs([]);
      return;
    }
    getMyNfts();
    // getBootcampNFTs();
    // getStakedNFTs();
    // eslint-disable-next-line
  }, [wallet.connected]);

  return (
    <div className="rebirth-content">
      <div className="landing-banner">
        <img src={bannerImage} alt="" className="juiced-banner" />
        {/* <h1>IGNITION</h1> */}
      </div>
      <Container>
        <div className="describe">
          <div className="des-group">
            <div className="des-nft">
              <div className="immutable-nft">
                <img src={genesis} alt="" className="left-nft" />
                <h3>GENESIS</h3>
              </div>
              <div className="right-arrow">
                <RightDoubleArrowIcon />
              </div>
              <div>
                <img src={reborn} alt="" className="right-nft" />
                <h3>REBORN</h3>
              </div>
            </div>
            <div className="des-notice">
              <h3>Transformation</h3>
            </div>
          </div>
        </div>
        <div className="pricing-plan">
          <h2>SOL PRICING</h2>
          <div className="desc">
            <p>
              The pricing of the Rebirth depends on the amount of NFTs you
              decide to upgrade.
            </p>
            <p>
              The more NFTs you upgrade, the lower the price will be. The
              pricing is accumulative and works as follows:
            </p>
          </div>
          <div className="prices-line">
            <div className="price-item">
              <h3>1-2 NFTs:</h3>
              <p>0.6 SOL</p>
            </div>
            <div className="line">
              <hr />
            </div>
            <div className="price-item">
              <h3>3-5 NFTs:</h3>
              <p>0.5 SOL</p>
            </div>
            <div className="line">
              <hr />
            </div>
            <div className="price-item">
              <h3>6-11 NFTs:</h3>
              <p>0.4 SOL</p>
            </div>
            <div className="line">
              <hr />
            </div>
            <div className="price-item">
              <h3>12-23 NFTs:</h3>
              <p>0.35 SOL</p>
            </div>
            <div className="line">
              <hr />
            </div>
            <div className="price-item">
              <h3>24+ NFTs:</h3>
              <p>0.3 SOL</p>
            </div>
          </div>
        </div>
        <div className="juiced-nft-list">
          <div className="all-nft-mutable">
            <button className="non-mutable-btn" onClick={rebirthNft}>
              <span>
                Upgrade {selectedNFTs.length ? selectedNFTs.length : "all"} NFTs
              </span>
            </button>
          </div>
          <div className="title">
            <h2>Your NFTs</h2>
          </div>
          {/* <div className="h-sub-title">
            <h3>Regular staking</h3>
          </div>
          <div className="nft-list">
            {stakedLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {userStakedNFTs.length !== 0 &&
                  userStakedNFTs.map((item, key) => (
                    <NFTRebornCard
                      key={key}
                      image={item.image}
                      title={item.name}
                      address={item.address}
                      mutable={item.isUpgraded}
                      nftList={userJuicedNFTs}
                      stake
                    />
                  ))}
              </>
            )}
          </div>
          <div className="h-sub-title">
            <h3>Bootcamps</h3>
          </div>
          <div className="nft-list">
            {bootcampLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {userStakedBootCampNFTs.length !== 0 &&
                  userStakedBootCampNFTs.map((item, key) => (
                    <NFTJuicedCard
                      key={key}
                      image={item.image}
                      title={item.name}
                      address={item.address}
                      mutable={item.isUpgraded}
                      nftList={userJuicedBootCampNFTs}
                      bootcamp
                    />
                  ))}
              </>
            )}
          </div>
          <div className="h-sub-title">
            <h3>Your wallet</h3>
          </div> */}
          <div className="nft-list">
            {walletNFTs.length !== 0 &&
              walletNFTs.map((item, key) => (
                <NFTRebornCard
                  key={key}
                  image={item.image}
                  title={item.name}
                  address={item.address}
                  mutable={item.isUpgraded}
                  // nftList={walleMutabletNFTs}
                  newMetaLink={item.newMetaLink}
                  rebirthMetaLink={item.rebirthMetaLink}
                  selected={
                    !(
                      selectedNFTs
                        .map((select) => select.address)
                        .indexOf(item.address) === -1
                    )
                  }
                  onClick={handleCardClicked(item)}
                />
              ))}
          </div>
          {unstakedLoading && (
            <div className="nft-list">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
        </div>
      </Container>
      <Footer />
    </div>
  );
}
