import { useWallet } from "@solana/wallet-adapter-react";
import bannerImage from "../assets/img/juiced.jpg";
import Container from "../components/Container";
import NFTJuicedCard from "../components/NFTJuicedCard";
import RightDoubleArrowIcon from "../assets/icons/rightDoubleArrow";
import { useEffect, useState } from "react";
import {
  getMyNft,
  getUserPoolState as getUserBootCampPoolState,
  mutNftFromBootcamp,
  nftToMutable,
} from "../contexts/bootcamp_helper";
import { getNftMetaData } from "../contexts/helper";
import { PublicKey } from "@solana/web3.js";
import nftList from "../contexts/old_to_new.json";
import { IMMUTABLE_COLLECTION, MUTABLE_COLLECTION } from "../config";
import Footer from "../components/Footer";
import fire from "../assets/img/fire.png";
import mutable from "../assets/img/mutable.png";
import SkeletonCard from "../components/SkeletonCard";

export default function Juiced() {
  // ------------page state-----------
  const wallet = useWallet();

  const [userStakedBootCampNFTs, setUserStakedBootCampNFTs] = useState([]);
  const [userJuicedNFTs, setUserJuicedNFTs] = useState([]);
  const [walletNFTs, setWalletNFTs] = useState([]);
  const [walleMutabletNFTs, setWalletMutableNFTs] = useState([]);
  
  const [stakedLoading, setStakedLoading] = useState(false);
  const [unstakedLoading, setUnStakedLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStateNFTs = async () => {
    setStakedLoading(true);
    let nftBootCampDump = [];
    let nftJuicedDump = [];
    const bootcamp_list = await getUserBootCampPoolState(wallet.publicKey);
    if (bootcamp_list !== null) {
      for (let i = 0; i < bootcamp_list.stakedCount.toNumber(); i++) {
        const nft = await getNftMetaData(
          new PublicKey(bootcamp_list.stakedMints[i].mint)
        );
        if (nft.data.data.uri) {
          await fetch(nft.data.data.uri)
            .then((resp) => resp.json())
            .then((json) => {
              nftBootCampDump.push({
                name: json.name,
                image: json.image,
                mint: nft.data.mint,
                address: bootcamp_list.stakedMints[i].mint.toBase58(),
                isMutable: 1,
                // isMutable: nft.data.isMutable,
                // legendary: legendaryValidatie(json),
              });
            }).catch((e) => {
              console.log("Error while fetching", nft.mint);
              console.log(e);
            });
        }

        for (let j = 0; j < nftList.length; j++) {
          if (
            nftList[j].oldPubkey ===
            bootcamp_list.stakedMints[i].mint.toBase58()
          ) {
            const newNft = await getNftMetaData(
              new PublicKey(nftList[j].newPubkey)
            );

            if (newNft.data.data.uri) {
              await fetch(newNft.data.data.uri)
                .then((resp) => resp.json())
                .then((json) => {
                  nftJuicedDump.push({
                    name: json.name,
                    image: json.image,
                    address: nftList[j].newPubkey,
                    oldaddress: bootcamp_list.stakedMints[i].mint.toBase58(),
                    // tier: bootcamp_list.stakedMints[i].tier.toNumber(),
                    // legendary: legendaryValidatie(json),
                  });
                }).catch((e) => {
                  console.log("Error while fetching", nft.mint);
                  console.log(e);
                });
            }
          }
        }
      }
    }

    for (let i = 0; i < nftBootCampDump.length; i++) {
      let j;
      for (j = 0; j < nftList.length; j++) {
        if (nftBootCampDump[i].address === nftList[j].oldPubkey) {
          break;
        }
      }
      if (j !== nftList.length) {
        nftBootCampDump[i].isMutable = 0;
      }
    }

    setUserStakedBootCampNFTs(nftBootCampDump);
    setUserJuicedNFTs(nftJuicedDump);
    setStakedLoading(false);
  };

  const mutableNft = async () => {
    if (userStakedBootCampNFTs.length) {
      for (let i = 0; i < userStakedBootCampNFTs.length; i++) {
        if (userStakedBootCampNFTs[i].isMutable === 0) {
          await mutNftFromBootcamp(
            wallet,
            new PublicKey(userStakedBootCampNFTs[i].address),
            () => setLoading(true),
            () => setLoading(false),
            () => updatePage()
          );
        }
      }
    }
    if (walletNFTs.length) {
      for (let i = 0; i < walletNFTs.length; i++) {
        if (walletNFTs[i].isMutable === 0) {
          await nftToMutable(wallet, new PublicKey(walletNFTs[i].address));
          // for (let j = 0; j < nftList.length; j++) {
          //   if (nftList[j].oldPubkey === walletNFTs[i].address) {
          //     const nft = await getNftMetaData(
          //       new PublicKey(nftList[j].newPubkey)
          //     );
          //     setChangeNftName(nft.data.data.name);
          //   }
          // }
        }
      }
    }
  };

  const updatePage = () => {
    console.log("Update >>");
  };

  const getMyNfts = async () => {
    setUnStakedLoading(true);
    const list = await getMyNft(wallet);
    let userNFTList = [];
    let nftJuicedDump = [];
    setUnStakedLoading(false);
    if (list) {
      console.log(list);
      for (let nft of list) {
        if (
          nft.data.creators && (
          nft.data.creators[0]?.address === IMMUTABLE_COLLECTION ||
          nft.data.creators[0]?.address === MUTABLE_COLLECTION
          )
        ) {
          if (nft.data.uri) {
            await fetch(nft.data.uri)
              .then((resp) => resp.json())
              .then((json) => {
                userNFTList.push({
                  name: json.name,
                  image: json.image,
                  address: nft.mint,
                  isMutable: nft.isMutable,
                  // legendary: legendaryValidatie(json),
                });
                setWalletNFTs(userNFTList);
              }).catch((e) => {
                console.log("Error while fetching", nft.mint);
                console.log(e);
              });
          }

          if (!nft.isMutable)
            for (let j = 0; j < nftList.length; j++) {
              if (nftList[j].oldPubkey === nft.mint) {
                const newNft = await getNftMetaData(
                  new PublicKey(nftList[j].newPubkey)
                );

                if (newNft.data.data.uri) {
                  await fetch(newNft.data.data.uri)
                    .then((resp) => resp.json())
                    .then((json) => {
                      nftJuicedDump.push({
                        name: json.name,
                        image: json.image,
                        address: nftList[j].newPubkey,
                        oldaddress: nft.mint,
                        // tier: bootcamp_list.stakedMints[i].tier.toNumber(),
                        // legendary: legendaryValidatie(json),
                      });
                    }).catch((e) => {
                      console.log("Error while fetching", nftList[j].newPubkey);
                      console.log(e);
                    });
                }
                break;
              }
            }
        }
      }

      console.log(userNFTList);
      console.log(nftJuicedDump);
      setWalletMutableNFTs(nftJuicedDump);
      setWalletNFTs(userNFTList);
    }
  };

  // const getTest = async () => {};

  useEffect(() => {
    if (!wallet.publicKey) {
      setWalletMutableNFTs([]);
      setWalletNFTs([]);
      return;
    }
    getMyNfts();
    getStateNFTs();
    // eslint-disable-next-line
  }, [wallet.connected]);

  return (
    <div className="juiced-content">
      <div className="landing-banner">
        <img src={bannerImage} alt="" className="juiced-banner" />
        <h1>IGNITION</h1>
      </div>
      <Container>
        <div className="describe">
          <div className="des-group">
            <div className="des-nft">
              <div className="immutable-nft">
                <img src={mutable} alt="" className="left-nft" />
                <img src={fire} alt="" className="fire-effect" />
                <h3>NON-MUTABLE</h3>
              </div>
              <div className="right-arrow">
                <h3>FREE</h3>
                <RightDoubleArrowIcon />
              </div>
              <div>
                <img src={mutable} alt="" className="right-nft" />
                <h3>MUTABLE</h3>
              </div>
            </div>
            <div className="des-notice">
              <h3>
                You will receive a new NFT with the exact same art, rank, and
                perks within the same collection. The old, non-mutable NFT will
                be burned
              </h3>
            </div>
          </div>
        </div>
        <div className="juiced-nft-list">
          <div className="title">
            <h2>Your NFTs</h2>
          </div>
          <div className="all-nft-mutable">
            <button className="non-mutable-btn" onClick={mutableNft}>
              <span>Make All NFT's Mutable</span>
            </button>
          </div>
          <div className="h-sub-title">
            <h3>NFT's staked in Bootcamp</h3>
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
            {userStakedBootCampNFTs.length !== 0 &&
              userStakedBootCampNFTs.map((item, key) => (
                <NFTJuicedCard
                  key={key}
                  image={item.image}
                  title={item.name}
                  address={item.address}
                  mutable={item.isMutable}
                  nftList={userJuicedNFTs}
                  stake
                />
              ))}
            </>
          )}
          </div>
          <div className="h-sub-title">
            <h3>NFTs in your Wallet</h3>
          </div>
          <div className="nft-list">
          {unstakedLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
            {walletNFTs.length !== 0 &&
              walletNFTs.map((item, key) => (
                <NFTJuicedCard
                  key={key}
                  image={item.image}
                  title={item.name}
                  address={item.address}
                  mutable={item.isMutable}
                  nftList={walleMutabletNFTs}
                />
              ))}
            </>
          )}
          </div>
        </div>
        <div className="soon">
          <h2>The Juicing is happening soon...</h2>
        </div>
        {/* {wallet.publicKey !== null && (
          <>
            <div className="soon">The Juicing is happening soon...</div>
          </>
        )} */}
      </Container>
      <Footer />
    </div>
  );
}
