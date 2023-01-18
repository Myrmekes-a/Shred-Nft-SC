import { useWallet } from "@solana/wallet-adapter-react";
import bannerImage from "../assets/img/juiced.jpg";
import Container from "../components/Container";
import NFTJuicedCard from "../components/NFTJuicedCard";
import RightDoubleArrowIcon from "../assets/icons/rightDoubleArrow";
import { useEffect, useState } from "react";
import {
  getMyNft,
  getUserPoolState as getUserBootCampPoolState,
  mutAllNftFromBootcamp,
  allNftToMutable,
} from "../contexts/bootcamp_helper";
import {
  getNftMetaData,
  getUserPoolState,
  mutAllNftFromStaking,
} from "../contexts/helper";
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

  const [userStakedNFTs, setUserStakedNFTs] = useState([]);
  const [userStakedBootCampNFTs, setUserStakedBootCampNFTs] = useState([]);
  const [userJuicedNFTs, setUserJuicedNFTs] = useState([]);
  const [userJuicedBootCampNFTs, setUserJuicedBootCampNFTs] = useState([]);
  const [walletNFTs, setWalletNFTs] = useState([]);
  const [walleMutabletNFTs, setWalletMutableNFTs] = useState([]);

  const [stakedLoading, setStakedLoading] = useState(false);
  const [bootcampLoading, setBootCampLoading] = useState(false);
  const [unstakedLoading, setUnStakedLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [_forceRender, setForceRender] = useState(false);

  const getBootcampNFTs = async () => {
    setBootCampLoading(true);
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
            })
            .catch((e) => {
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
                })
                .catch((e) => {
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
    setUserJuicedBootCampNFTs(nftJuicedDump);
    setBootCampLoading(false);
  };

  const getStakedNFTs = async () => {
    setStakedLoading(true);
    let nftStakedDump = [];
    let nftJuicedDump = [];
    const staked_list = await getUserPoolState(wallet.publicKey);
    if (staked_list !== null) {
      for (let i = 0; i < staked_list.stakedCount.toNumber(); i++) {
        const nft = await getNftMetaData(
          new PublicKey(staked_list.stakedMints[i].mint)
        );
        if (nft.data.data.uri) {
          await fetch(nft.data.data.uri)
            .then((resp) => resp.json())
            .then((json) => {
              nftStakedDump.push({
                name: json.name,
                image: json.image,
                mint: nft.data.mint,
                address: staked_list.stakedMints[i].mint.toBase58(),
                isMutable: 1,
              });
            })
            .catch((e) => {
              console.log("Error while fetching", nft.mint);
              console.log(e);
            });
        }

        for (let j = 0; j < nftList.length; j++) {
          if (
            nftList[j].oldPubkey === staked_list.stakedMints[i].mint.toBase58()
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
                    oldaddress: staked_list.stakedMints[i].mint.toBase58(),
                    // tier: staked_list.stakedMints[i].tier.toNumber(),
                    // legendary: legendaryValidatie(json),
                  });
                })
                .catch((e) => {
                  console.log("Error while fetching", nft.mint);
                  console.log(e);
                });
            }
          }
        }
      }
    }

    for (let i = 0; i < nftStakedDump.length; i++) {
      let j;
      for (j = 0; j < nftList.length; j++) {
        if (nftStakedDump[i].address === nftList[j].oldPubkey) {
          break;
        }
      }
      if (j !== nftList.length) {
        nftStakedDump[i].isMutable = 0;
      }
    }

    setUserStakedNFTs(nftStakedDump);
    setUserJuicedNFTs(nftJuicedDump);
    setStakedLoading(false);
  };

  const mutableNft = async () => {
    const stakedNFTs = userStakedNFTs
      .filter((nft) => !nft.isMutable)
      .map((nft) => new PublicKey(nft.address));
    console.log("stakedNFTs -->", stakedNFTs);
    if (stakedNFTs.length) {
      await mutAllNftFromStaking(
        wallet,
        stakedNFTs,
        () => setLoading(true),
        () => setLoading(false),
        () => updatePage()
      );
    }

    const stakedBootcampNFTs = userStakedBootCampNFTs
      .filter((nft) => !nft.isMutable)
      .map((nft) => new PublicKey(nft.address));
    console.log("stakedBootcampNFTs -->", stakedBootcampNFTs);
    if (stakedBootcampNFTs.length) {
      await mutAllNftFromBootcamp(
        wallet,
        stakedBootcampNFTs,
        () => setLoading(true),
        () => setLoading(false),
        () => updatePage()
      );
    }

    const unstakedNFTs = walletNFTs
      .filter((nft) => !nft.isMutable)
      .map((nft) => new PublicKey(nft.address));
    console.log("unstaked NFTs -->", unstakedNFTs);
    if (unstakedNFTs.length) {
      await allNftToMutable(
        wallet,
        unstakedNFTs,
        () => setLoading(true),
        () => setLoading(false),
        () => updatePage()
      );
    }
  };

  const updatePage = () => {
    console.log("Update >>");
  };

  const getMyNfts = async () => {
    setWalletMutableNFTs([]);
    setWalletNFTs([]);
    setForceRender((old) => !old);
    setUnStakedLoading(true);

    const list = await getMyNft(wallet);
    let userNFTList = [];
    let nftJuicedDump = [];
    if (list) {
      console.log(list);
      for (let nft of list) {
        if (
          nft.data.creators &&
          (nft.data.creators[0]?.address === IMMUTABLE_COLLECTION ||
            nft.data.creators[0]?.address === MUTABLE_COLLECTION)
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
                console.log("->", userNFTList.length);
                setWalletNFTs(userNFTList);
                setForceRender((old) => !old);
              })
              .catch((e) => {
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
                    })
                    .catch((e) => {
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
    setUnStakedLoading(false);
  };

  // const getTest = async () => {};

  useEffect(() => {
    if (!wallet.publicKey) {
      setWalletNFTs([]);
      setWalletMutableNFTs([]);
      setUserStakedNFTs([]);
      setUserStakedBootCampNFTs([]);
      setUserJuicedNFTs([]);
      setUserJuicedBootCampNFTs([]);
      return;
    }
    getMyNfts();
    getBootcampNFTs();
    getStakedNFTs();
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
            <h3>NFT's staked in Normal Pool</h3>
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
            <h3>NFT's staked in Bootcamp</h3>
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
                      mutable={item.isMutable}
                      nftList={userJuicedBootCampNFTs}
                      bootcamp
                    />
                  ))}
              </>
            )}
          </div>
          <div className="h-sub-title">
            <h3>NFTs in your Wallet</h3>
          </div>
          <div className="nft-list">
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
          </div>
          {unstakedLoading && (
            <div className="nft-list">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
        </div>
        <div className="soon">
          <h2>The Juicing is happening soon...</h2>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
