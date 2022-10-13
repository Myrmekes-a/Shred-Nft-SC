import { useEffect, useState } from "react";
import Container from "../components/Container";
import Footer from "../components/Footer";
import HomeBanner from "../components/HomeBanner";
import BootCamps from "../components/BootCamps";
import NFTCard from "../components/NFTCard";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { useWallet } from "@solana/wallet-adapter-react";
import { APE_CREATOR, solConnection } from "../config";
import SkeletonCard from "../components/SkeletonCard";
import { getNftMetaData } from "../contexts/helper";
import {
  getGlobalState as getGlobalBootCampState,
  getUserPoolState as getUserBootCampPoolState,
} from "../contexts/bootcamp_helper";
import { PublicKey } from "@solana/web3.js";

export default function Bootcamp({ bootCampIndex, setBootCampIndex }) {
  // ------------page state-----------
  const wallet = useWallet();
  const [stakedLoading, setStakedLoading] = useState(false);
  const [unstakedLoading, setUnStakedLoading] = useState(false);
  const [hide, setHide] = useState(false);

  // ------------content state-----------
  const [userStakedBootCampNFTs, setUserStakedBootCampNFTs] = useState([]);
  const [unstaked, setUnstaked] = useState([]);
  const [totalGlabalStakedCnt, setTotalGlabalStakedCnt] = useState(0);

  const getGlobalStateNFTs = async () => {
    const bootcamp_list = await getGlobalBootCampState();
    setTotalGlabalStakedCnt(bootcamp_list.totalStakedCount.toNumber());
  };

  const getUnstakedNFTs = async () => {
    setUnStakedLoading(true);
    let nftDump = [];
    const unstakedNftList = await getMetadataDetail();
    if (unstakedNftList.length !== 0) {
      for (let item of unstakedNftList) {
        if (
          item.data.creators &&
          item.data.creators[0]?.address === APE_CREATOR &&
          item.data.creators[0]?.verified
        ) {
          await fetch(item.data.uri)
            .then((resp) => resp.json())
            .then((json) => {
              nftDump.push({
                name: json.name,
                image: json.image,
                mint: item.mint,
                legendary: legendaryValidatie(json),
              });
            })
            .catch((e) => {
              console.log("Error while fetching ", item.mint);
              console.log(e);
            });
        }
      }
    }
    setUnstaked(nftDump);
    setHide(!hide);
    setUnStakedLoading(false);
  };

  const getStakedNFTs = async () => {
    setStakedLoading(true);
    let nftBootCampDump = [];
    const bootcamp_list = await getUserBootCampPoolState(wallet.publicKey);
    if (bootcamp_list !== null) {
      for (let i = 0; i < bootcamp_list.stakedCount.toNumber(); i++) {
        const nft = await getNftMetaData(
          new PublicKey(bootcamp_list.stakedMints[i].mint)
        );
        await fetch(nft.data.data.uri)
          .then((resp) => resp.json())
          .then((json) => {
            nftBootCampDump.push({
              name: json.name,
              image: json.image,
              mint: nft.data.mint,
              tier: bootcamp_list.stakedMints[i].tier.toNumber(),
              legendary: legendaryValidatie(json),
            });
          });
      }
    }
    setUserStakedBootCampNFTs(nftBootCampDump);
    setStakedLoading(false);
    setHide(!hide);
  };

  const getMetadataDetail = async () => {
    const nftsList = await getParsedNftAccountsByOwner({
      publicAddress: wallet.publicKey,
      connection: solConnection,
    });
    return nftsList;
  };

  const legendaryValidatie = (nft) => {
    console.log("Legendary", nft);
    const lagendary_trait = nft.attributes.find(
      ({ trait_type }) => trait_type === "Legendary"
    );
    return !(lagendary_trait.value === "None");
  };

  const updatePageStates = () => {
    getUnstakedNFTs();
    getStakedNFTs();
  };

  useEffect(() => {
    if (wallet.publicKey !== null) {
      updatePageStates();
    } else {
      setUnstaked([]);
      setUserStakedBootCampNFTs([]);
    }
    getGlobalStateNFTs();
    // eslint-disable-next-line
  }, [wallet.connected]);

  useEffect(() => {
    if (!wallet.publicKey) {
      setBootCampIndex(0);
    }
    // eslint-disable-next-line
  }, [wallet.publicKey, wallet.connected, bootCampIndex, setBootCampIndex]);

  return (
    <div className="main-content">
      <Container>
        <HomeBanner
          forceRender={hide}
          tagIndex={1}
          bootCampIndex={bootCampIndex}
          setBootCampIndex={setBootCampIndex}
        />
        {bootCampIndex === 0 && (
          <>
            <BootCamps
              forceRender={hide}
              bootCampIndex={bootCampIndex}
              setBootCampIndex={setBootCampIndex}
            />
            <div className="bootcamp-status">
              <span>Apes needed until the price increases by 25%:</span>
              <div className="bootcamp-staked">
                {totalGlabalStakedCnt}/{3000}
              </div>
            </div>
          </>
        )}
        {wallet.publicKey !== null && bootCampIndex !== 0 && (
          <>
            <div className="nft-list">
              <h2 className="list-title">
                {bootCampIndex === 1
                  ? "Apes on CrossFit Bootcamp"
                  : bootCampIndex === 2
                  ? "Apes on MMA Bootcamp"
                  : bootCampIndex === 3
                  ? "Apes on Military Bootcamp"
                  : ""}
                {!stakedLoading && (
                  <span>
                    (
                    {
                      userStakedBootCampNFTs.filter(
                        (item) => item.tier === bootCampIndex
                      ).length
                    }
                    )
                  </span>
                )}
              </h2>
              {stakedLoading ? (
                <div className="list-content">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="list-content">
                  {userStakedBootCampNFTs.length !== 0 &&
                    userStakedBootCampNFTs
                      .filter((item) => item.tier === bootCampIndex)
                      .map((item, key) => (
                        <NFTCard
                          key={key}
                          isStaked={true}
                          image={item.image}
                          name={item.name}
                          mint={item.mint}
                          legendary={item.legendary}
                          updatePageStates={updatePageStates}
                          tagIndex={1}
                          bootCampIndex={bootCampIndex}
                        />
                      ))}
                </div>
              )}
            </div>
            <div className="nft-list">
              <h2 className="list-title">
                {bootCampIndex === 1
                  ? "Send Apes on CrossFit Bootcamp"
                  : bootCampIndex === 2
                  ? "Send Apes on MMA Bootcamp"
                  : bootCampIndex === 3
                  ? "Send Apes on Military Bootcamp"
                  : ""}
                {!unstakedLoading && <span>({unstaked.length})</span>}
              </h2>
              {unstakedLoading ? (
                <div className="list-content">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="list-content">
                  {unstaked.length !== 0 &&
                    unstaked.map((item, key) => (
                      <NFTCard
                        key={key}
                        isStaked={false}
                        image={item.image}
                        name={item.name}
                        mint={item.mint}
                        legendary={item.legendary}
                        updatePageStates={updatePageStates}
                        tagIndex={1}
                        bootCampIndex={bootCampIndex}
                      />
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
}
