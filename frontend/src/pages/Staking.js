import { useEffect, useState } from "react";
import Container from "../components/Container";
import Footer from "../components/Footer";
import HomeBanner from "../components/HomeBanner";
import NFTCard from "../components/NFTCard";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { useWallet } from "@solana/wallet-adapter-react";
import { DIAMOND_CREATOR, IMMUTABLE_COLLECTION, MUTABLE_COLLECTION, solConnection } from "../config";
import SkeletonCard from "../components/SkeletonCard";
import { getNftMetaData, getUserPoolState } from "../contexts/helper";
import { PublicKey } from "@solana/web3.js";

export default function Staking() {
  // ------------page state-----------
  const wallet = useWallet();
  const [stakedLoading, setStakedLoading] = useState(false)
  const [unstakedLoading, setUnStakedLoading] = useState(false)
  const [hide, setHide] = useState(false);

  // ------------content state-----------
  const [userStakedNFTs, setUserStakedNFTs] = useState([]);
  const [unstaked, setUnstaked] = useState([]);

  const getUnstakedNFTs = async () => {
    setUnStakedLoading(true);
    let nftDump = [];
    const unstakedNftList = await getMetadataDetail();
    if (unstakedNftList.length !== 0) {
      for (let item of unstakedNftList) {
        if (item.data.creators
          && (item.data.creators[0]?.address === IMMUTABLE_COLLECTION || item.data.creators[0]?.address === MUTABLE_COLLECTION || item.data.creators[0]?.address === DIAMOND_CREATOR)
          && item.data.creators[0]?.verified) {
          await fetch(item.data.uri)
            .then(resp =>
              resp.json()
            ).then((json) => {
              nftDump.push({
                "name": json.name,
                "image": json.image,
                "mint": item.mint,
                "legendary": legendaryValidatie(json)
              })
            }).catch((e)=>{
              console.log("Error while fetching ", item.mint);
              console.log(e);
            });
        }
      }
    }
    setUnstaked(nftDump);
    setHide(!hide);
    setUnStakedLoading(false);
  }

  const getStakedNFTs = async () => {
    setStakedLoading(true);
    let nftDump = [];
    const list = await getUserPoolState(wallet.publicKey);
    if (list !== null) {
      for (let i = 0; i < list.stakedCount.toNumber(); i++) {
        const nft = await getNftMetaData(new PublicKey(list.stakedMints[i].mint))
        await fetch(nft.data.data.uri)
          .then(resp =>
            resp.json()
          ).then((json) => {
            nftDump.push({
              "name": json.name,
              "image": json.image,
              "mint": nft.data.mint,
              "legendary": legendaryValidatie(json)
            })
          })
      }
    }
    setUserStakedNFTs(nftDump);
    setStakedLoading(false);
    setHide(!hide);
  }

  const getMetadataDetail = async () => {
    const nftsList = await getParsedNftAccountsByOwner({ publicAddress: wallet.publicKey, connection: solConnection });
    return nftsList;
  }

  const legendaryValidatie = (nft) => {
    const lagendary_trait = nft.attributes.find(({ trait_type }) => trait_type === "Legendary");
    if (!lagendary_trait) return false;
    return !(lagendary_trait.value === "None")
  }

  const updatePageStates = () => {
    getUnstakedNFTs();
    getStakedNFTs();
  }

  useEffect(() => {
    if (wallet.publicKey !== null) {
      updatePageStates();
    } else {
      setUnstaked([]);
      setUserStakedNFTs([]);
    }
    // eslint-disable-next-line
  }, [wallet.connected])

  return (
    <div className="main-content">
      <Container>
        <HomeBanner
          forceRender={hide}
        />
        {wallet.publicKey !== null &&
          <>
            <div className="nft-list">
              <h2 className="list-title">{
                  "Staked Apes"
                }{!stakedLoading && <span>({
                  userStakedNFTs.length
                })</span>}</h2>
              {stakedLoading ?
                <div className="list-content">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
                :
                <div className="list-content">
                  {userStakedNFTs.length !== 0 && userStakedNFTs.map((item, key) => (
                    <NFTCard
                      key={key}
                      isStaked={true}
                      image={item.image}
                      name={item.name}
                      mint={item.mint}
                      legendary={item.legendary}
                      updatePageStates={updatePageStates}
                      tagIndex={0}
                    />
                  ))}
                </div>
              }
            </div>
            <div className="nft-list">
              <h2 className="list-title">{
                "Unstaked Apes"
                }{!unstakedLoading && <span>({unstaked.length})</span>}</h2>
              {unstakedLoading ?
                <div className="list-content">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
                :
                <div className="list-content">
                  {unstaked.length !== 0 && unstaked.map((item, key) => (
                    <NFTCard
                      key={key}
                      isStaked={false}
                      image={item.image}
                      name={item.name}
                      mint={item.mint}
                      legendary={item.legendary}
                      updatePageStates={updatePageStates}
                      tagIndex={0}
                    />
                  ))}
                </div>
              }
            </div>
          </>
        }
      </Container>
      <Footer />
    </div>
  );
}
