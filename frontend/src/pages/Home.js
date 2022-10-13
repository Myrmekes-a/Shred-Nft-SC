import { useEffect, useRef, useState } from "react";

import Container from "../components/Container";
import Footer from "../components/Footer";
import TwitterIcon from "../assets/icons/twitter";
import LinkedInIcon from "../assets/icons/linkedin";
import LeftArrowIcon from "../assets/icons/leftArrow";
import RightArrowIcon from "../assets/icons/rightArrow";
import { PrimaryButton } from "../components/styleHook";

import bannerImage from "../assets/img/banner.jpg";
import nft1Image from "../assets/img/nft1.jpg";
import nft2Image from "../assets/img/nft2.jpg";
import nft3Image from "../assets/img/nft3.jpg";
import nft4Image from "../assets/img/nft4.jpg";
import nft5Image from "../assets/img/nft5.jpg";
import nft6Image from "../assets/img/nft6.jpg";
import essentialsImage from "../assets/img/essentials.png";
import productImage from "../assets/img/product.png";
import homeImage from "../assets/img/home.png";
import tokenImage from "../assets/img/whey-token.png";
import coinImage from "../assets/img/coins.png";
import crossImage from "../assets/img/cross.png";
import storeImage from "../assets/img/shredstore.png";
import patternImage from "../assets/img/pattern.jpg";
import pengucciImage from "../assets/img/pengucci.png";
import chubeImage from "../assets/img/chube.png";
import avedionImage from "../assets/img/avedion.png";
import halsyImage from "../assets/img/halsy.png";
import libertyImage from "../assets/img/liberty.png";
import insiderImage from "../assets/img/insider.png";
import muxmanImage from "../assets/img/muxman.png";
import jefe1Image from "../assets/img/jefe1.png";
import acidbejImage from "../assets/img/acidbej.png";
import alexImage from "../assets/img/alex.png";
import unknownImage from "../assets/img/unknown.png";
import whiteCheckmarkImage from "../assets/img/white_checkmark.svg";
import yellowCheckmarkImage from "../assets/img/yellow_checkmark.svg";
import yellowDropmarkImage from "../assets/img/yellow_dropmark.svg";
import { SHRED_BACKEND_API_URL } from "../config";

export default function Home({ SCREEN_WIDTH, dimensions }) {
  const [teamViewer, setTeamViewer] = useState(0);
  const [shopIndex, setShopIndex] = useState(0);
  const [holderCount, setHolderCount] = useState(1359);

  const nfts = [nft1Image, nft2Image, nft3Image, nft4Image, nft5Image, nft6Image];
  const refLine1 = useRef(null);
  const refLine2 = useRef(null);
  const refLine3 = useRef(null);
  const refBox1 = useRef(null);
  const refBox2 = useRef(null);
  const refBox3 = useRef(null);

  const getUniqueHoders = async () => {
    console.log('=> Fetch Unique Holders');
    await fetch(SHRED_BACKEND_API_URL + '/api/unique_holders?rpc=https://rpc.ankr.com/solana').then((res) => res.json())
      .then((data) => {
        console.log('Response received');
        setHolderCount(data.holder_count);
      }).catch((e) => {
        console.log(e.message || e.msg || JSON.stringify(e));
      });
  }

  useEffect(() => {
    document.addEventListener("scroll", animation);
    getUniqueHoders();
    setInterval(() => {
      getUniqueHoders();
    }, 1000 * 60 * 60);
    const itvl = setInterval(() => {
      const now = Date.now();
      if (now % 5000 < 1000) {
        setShopIndex((val) => val === 2 ? 0 : val + 1);
      }
    }, 1000);
    return () => {
      clearInterval(itvl);
      document.removeEventListener("scroll", animation);
    }
  }, []);

  const animation = () => {
    let height = 400 - refLine1.current.getBoundingClientRect().top;
    if (height < 0) height = 0;
    refLine1.current.style.height = `${height}px`;
    height = 400 - refLine2.current.getBoundingClientRect().top;
    if (height < 0) height = 0;
    refLine2.current.style.height = `${height}px`;
    height = 400 - refLine3.current.getBoundingClientRect().top;
    if (height < 0) height = 0;
    refLine3.current.style.height = `${height}px`;
    height = 400 - refBox1.current.getBoundingClientRect().top;
    if (height > 0) refBox1.current.style.backgroundColor = `var(--second-color)`;
    else refBox1.current.style.backgroundColor = `#FFF`;
    height = 400 - refBox2.current.getBoundingClientRect().top;
    if (height > 0) refBox2.current.style.backgroundColor = `var(--second-color)`;
    else refBox2.current.style.backgroundColor = `#FFF`;
    height = 400 - refBox3.current.getBoundingClientRect().top;
    if (height > 0) refBox3.current.style.backgroundColor = `var(--second-color)`;
    else refBox3.current.style.backgroundColor = `#FFF`;
  };

  return (
    <div className="main-content">
      <div className="landing-banner">
        <img
          src={bannerImage}
          alt=""
        />
      </div>
      <Container>
        <div className="landing-welcome">
          <div className="landing-content">
            <h1>Welcome to the <span>Shredded Apes Gym Club</span>.</h1>
            <p>
              We are the world’s first Web3 Health &amp; Nutrition Brand.
              Our mission is to bring health &amp; fitness to the entire NFT space.
              How will we do it? By providing you high quality products/services that will get you fitter than ever!
            </p>
          </div>
          <div className="landing-buy-nft">
            <PrimaryButton className={"active"} disabled={false} onClick={() => {
              window.open("https://magiceden.io/marketplace/shredded_apes_gym_club", "_blank");
            }}>
              Buy on Magic Eden
            </PrimaryButton>
            <PrimaryButton className={"active"} disabled={false} onClick={() => {
              window.open("https://opensea.io/collection/shredded-apes-gym-club", "_blank");
            }}>
              Buy on Opensea
            </PrimaryButton>
          </div>
          <div className="landing-content" style={{ marginTop: '2rem' }}>
            <p>
              Shredded Apes currently has {holderCount} Unique Holders
            </p>
          </div>
        </div>
      </Container>
      <div className="landing-welcome" style={{ overflow: 'hidden' }}>
        <Container>
          <div className="landing-nft-bar-container">
            <div className="landing-nft-bar hidden">
              {dimensions.width > SCREEN_WIDTH[3] && nfts.map((imgSrc, key) =>
                <div className="landing-nft-box" key={key}>
                  <img
                    src={imgSrc}
                    alt=""
                  />
                </div>
              )}
              {dimensions.width <= SCREEN_WIDTH[3] && nfts.slice(1, -1).map((imgSrc, key) =>
                <div className="landing-nft-box" key={key}>
                  <img
                    src={imgSrc}
                    alt=""
                  />
                </div>
              )}
            </div>
            <div className="landing-nft-bar main">
              {dimensions.width > SCREEN_WIDTH[3] && [...nfts, ...nfts].map((imgSrc, key) =>
                <div className="landing-nft-box" key={key}>
                  <img
                    src={imgSrc}
                    alt=""
                  />
                </div>
              )}
              {dimensions.width <= SCREEN_WIDTH[3] && [...nfts.slice(1, -1), ...nfts.slice(1, -1)].map((imgSrc, key) =>
                <div className="landing-nft-box" key={key}>
                  <img
                    src={imgSrc}
                    alt=""
                  />
                </div>
              )}
            </div>
            <div className="landing-nft-bar left-back">
              {dimensions.width > SCREEN_WIDTH[3] && [...nfts, ...nfts].map((imgSrc, key) =>
                <div className="landing-nft-box" key={key}>
                  <img
                    src={imgSrc}
                    alt=""
                  />
                </div>
              )}
              {dimensions.width <= SCREEN_WIDTH[3] && [...nfts.slice(1, -1), ...nfts.slice(1, -1)].map((imgSrc, key) =>
                <div className="landing-nft-box" key={key}>
                  <img
                    src={imgSrc}
                    alt=""
                  />
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
      <div className="landing-store-container">
        <Container>
          <h1 className="section-title">Shred Store built on Web 3.0</h1>
          <p>
            SAGC is revolutionizing the Web 3 space with its own Nutrition Brand,
            Clothing Line and Gym essentials. {dimensions.width < SCREEN_WIDTH[2] ? '' : <br />}
            All purchasable in our webshop through <span>$WHEY</span>
          </p>
          <div className="landing-store-view-container">
            <div className="landing-store-view-left-overlay" />
            <div className={`landing-store-view ${shopIndex === 0 ? '' : shopIndex === 1 ? 'left' : 'far-left'}`}>
              <div className="landing-store">
                <div className="landing-store-content">
                  <div className="landing-store-info">
                    <div className="store-name">
                      <h2>Get Shredded</h2>
                      <p>Become a real Shredded Ape with our very own Nutrition Supplements!</p>
                    </div>
                    <div className="store-action">
                      <PrimaryButton className={"active"} disabled={false} onClick={() => {
                        window.open("https://www.shreddedapes.shop/products?category=nutrition", "_blank");
                      }}>
                        Shop Nutrition
                      </PrimaryButton>
                    </div>
                  </div>
                  <div className="landing-store-image">
                    <img
                      src={productImage}
                      alt=""
                      style={
                        dimensions.width > SCREEN_WIDTH[0] ?
                          { width: '56%' } :
                          dimensions.width > SCREEN_WIDTH[1] ?
                            { width: '70%' } :
                            dimensions.width > SCREEN_WIDTH[3] ?
                              { width: '80%' } :
                              { width: 250, marginTop: 60 }
                      }
                    />
                  </div>
                </div>
                <div className="landing-store-controller">
                  <div>
                    <div className="side-btn" onClick={() => { setShopIndex(2) }}>
                      <LeftArrowIcon />
                    </div>
                    <span> Swipe left</span>
                  </div>
                  <div>
                    <span> Swipe right</span>
                    <div className="side-btn" onClick={() => { setShopIndex(1) }}>
                      <RightArrowIcon />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`landing-store-view ${shopIndex === 0 ? 'right' : shopIndex === 1 ? '' : 'left'}`}>
              <div className="landing-store">
                <div className="landing-store-content">
                  <div className="landing-store-info">
                    <div className="store-name">
                      <h2>Rock The Brand</h2>
                      <p>
                        We have created multiple clothing pieces that can be worn during your
                        workout, as day-to-day wear or on lazy Sundays.
                      </p>
                    </div>
                    <div className="store-action">
                      <PrimaryButton className={"active"} disabled={false} onClick={() => {
                        window.open("https://www.shreddedapes.shop/products?category=clothing", "_blank");
                      }}>
                        Shop Clothing
                      </PrimaryButton>
                    </div>
                  </div>
                  <div className="landing-store-image">
                    <img
                      src={homeImage}
                      alt=""
                      style={
                        dimensions.width > SCREEN_WIDTH[0] ?
                          { width: 710, transform: 'translate(-117px, -31px)' } :
                          dimensions.width > SCREEN_WIDTH[1] ?
                            { width: 560, transform: 'translate(-190px, 45px)' } :
                            dimensions.width > SCREEN_WIDTH[2] ?
                              { width: 470, transform: 'translate(-40px, -60px)' } :
                              dimensions.width > SCREEN_WIDTH[3] ?
                                { width: 350, transform: 'translate(-30px, -30px)' } :
                                { width: 220, transform: 'translate(0px, 0px)' }
                      }
                    />
                  </div>
                </div>
                <div className="landing-store-controller">
                  <div>
                    <div className="side-btn" onClick={() => { setShopIndex(0) }}>
                      <LeftArrowIcon />
                    </div>
                    <span> Swipe left</span>
                  </div>
                  <div>
                    <span> Swipe right</span>
                    <div className="side-btn" onClick={() => { setShopIndex(2) }}>
                      <RightArrowIcon />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`landing-store-view ${shopIndex === 0 ? 'far-right' : shopIndex === 1 ? 'right' : ''}`}>
              <div className="landing-store">
                <div className="landing-store-content">
                  <div className="landing-store-info">
                    <div className="store-name">
                      <h2>Gym Essentials</h2>
                      <p>
                        To get the most out of your workout, <br />
                        make sure to check out our gym essentials.
                      </p>
                    </div>
                    <div className="store-action">
                      <PrimaryButton className={"active"} disabled={false} onClick={() => {
                        window.open("https://www.shreddedapes.shop/products?category=essentials", "_blank");
                      }}>
                        Shop Essentials
                      </PrimaryButton>
                    </div>
                  </div>
                  <div className="landing-store-image">
                    <img
                      src={essentialsImage}
                      alt=""
                      style={
                        dimensions.width > SCREEN_WIDTH[0] ?
                          { width: 830, transform: 'translateY(-90px)' } :
                          dimensions.width > SCREEN_WIDTH[1] ?
                            { width: 705, transform: 'translate(-100px, -28px)' } :
                            dimensions.width > SCREEN_WIDTH[2] ?
                              { width: 540, transform: 'translate(-40px, -90px)' } :
                              dimensions.width > SCREEN_WIDTH[3] ?
                                { width: 420, transform: 'translate(-30px, -60px)' } :
                                { width: 250, transform: 'translate(0px, -20px)' }
                      }
                    />
                  </div>
                </div>
                <div className="landing-store-controller">
                  <div>
                    <div className="side-btn" onClick={() => { setShopIndex(1) }}>
                      <LeftArrowIcon />
                    </div>
                    <span> Swipe left</span>
                  </div>
                  <div>
                    <span> Swipe right</span>
                    <div className="side-btn" onClick={() => { setShopIndex(0) }}>
                      <RightArrowIcon />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="landing-store-view-right-overlay" />
          </div>
        </Container>
      </div>
      <Container>
        <div className="landing-project-container">
          <h1 className="section-title">Project Info</h1>
          <div className="landing-project">
            <div className="landing-content">
              <div className="landing-header">
                <h2><span>$Whey</span></h2>
                <div className="landing-nft-box" style={{ marginLeft: '100px' }}>
                  <img
                    src={tokenImage}
                    alt=""
                  />
                </div>
              </div>
              <p>
                $WHEY is the centerpiece of the Shredded Apes Ecosystem. The main aim
                of our token is to bring real world utility in terms of health &amp; fitness to the
                NFT space. We want to make it a standard in purchasing nutrition, activewear,
                online coaching and much more. Through $WHEY we plan to unite health
                enthusiasts, not only in SAGC, but in all other NFT communities as well.
              </p>
            </div>
            <div className="landing-content">
              <div className="landing-header">
                <h2><span>Staking</span></h2>
                <div className="landing-nft-box" style={{ marginLeft: '100px' }}>
                  <img
                    src={coinImage}
                    alt=""
                  />
                </div>
              </div>
              <p>
                You can stake your Shredded Apes which earns you $WHEY every day. <br />
                A common Ape will earn you 10 $WHEY every day, a legendary 25 $WHEY and if
                you stake 3 apes simultaneously you will earn 1.25x <br />
                on top of you regular yield.
              </p>
            </div>
            <div className="landing-content" style={{ paddingTop: 10 }}>
              <div className="landing-header" style={{ marginTop: 0 }}>
                <h2><span>Bootcamps</span></h2>
                <div className="landing-nft-box" style={
                  dimensions.width > SCREEN_WIDTH[0] ?
                    { marginLeft: 40, width: 280 } :
                    dimensions.width > SCREEN_WIDTH[1] ?
                      { marginLeft: 40, width: 240 } :
                      dimensions.width > SCREEN_WIDTH[2] ?
                        { marginLeft: 40, width: 140 } :
                        dimensions.width > SCREEN_WIDTH[3] ?
                          { marginLeft: 40, width: 130 } :
                          { marginLeft: 40, width: 280 }
                }>
                  <img
                    src={crossImage}
                    alt=""
                  />
                </div>
              </div>
              <p>
                Make your Apes earn you even more by sending them on a Bootcamp of your choice!
                The higher the intensity of the bootcamp,<br />
                the more $WHEY they will earn you. If you decide to send them on our most
                hard-core Military Bootcamp, you will earn a staggering 2x more $WHEY!
              </p>
            </div>
            <div className="landing-content" style={{ paddingTop: 10 }}>
              <div className="landing-header" style={{ paddingTop: 0 }}>
                <h2><span>Shred Store</span></h2>
                <div className="landing-nft-box" style={
                  dimensions.width > SCREEN_WIDTH[0] ?
                    { marginLeft: 30, width: 280 } :
                    dimensions.width > SCREEN_WIDTH[1] ?
                      { marginLeft: 30, width: 240 } :
                      dimensions.width > SCREEN_WIDTH[2] ?
                        { marginLeft: 20, width: 140 } :
                        dimensions.width > SCREEN_WIDTH[3] ?
                          { marginLeft: 20, width: 130 } :
                          { marginLeft: 15, width: 120 }
                }>
                  <img
                    src={storeImage}
                    alt=""
                  />
                </div>
              </div>
              <p>
                This is where your generated $WHEY can be utilised. All items can be bought
                using $WHEY cryptocurrency. Therefore, if you stake your ape for long enough,
                you won't ever run out of supplements and have an opportunity for a lifetime
                supply of nutrition products &amp; clothing. More products are coming soon!
              </p>
            </div>
          </div>
        </div>
      </Container>
      <div className="landing-roadmap-container" style={{ backgroundImage: `url(${patternImage})` }}>
        <div>
          <Container>
            <h1 className="section-title">Roadmap</h1>
            <div className="landing-project" style={{ position: 'relative' }}>
              <div className="landing-roadmap-progress">
                <div className="round-box" style={{ backgroundColor: 'var(--second-color)' }}></div>
                <div className="line-box">
                  <div ref={refLine1} />
                </div>
                <div ref={refBox1} className="round-box"></div>
                <div className="line-box">
                  <div ref={refLine2} />
                </div>
                <div ref={refBox2} className="round-box"></div>
                <div className="line-box">
                  <div ref={refLine3} />
                </div>
                <div ref={refBox3} className="round-box"></div>
                <div className="line-box"></div>
                <div className="round-box"></div>
                <div className="line-box"></div>
                <div className="round-box"></div>
                <div className="line-box"></div>
                <div className="round-box"></div>
                <div className="line-box"></div>
                <div className="round-box"></div>
              </div>
              <div className="landing-content">
                <div className="landing-header">
                  <h2>$WHEY</h2>
                  <div className="landing-nft-box">
                    <img
                      src={yellowCheckmarkImage}
                      alt=""
                    />
                  </div>
                </div>
                <p>
                  $WHEY is the official utility token of the Shredded Apes metaverse,
                  providing a way to get access to our product line, which includes
                  nutrition, clothing, in-house services, discounts on secondary NFT
                  collections, in-game decisions and holders access to high-end perks.
                  Most of these utilities will have burning mechanisms in order to
                  reduce the total supply.
                </p>
              </div>
              <div className="landing-content blank">
              </div>
              <div className="landing-content blank">
              </div>
              <div className="landing-content">
                <div className="landing-header">
                  <h2>Staking</h2>
                  <div className="landing-nft-box">
                    <img
                      src={yellowCheckmarkImage}
                      alt=""
                    />
                  </div>
                </div>
                <p>
                  Staking is when your ape is shredding in local Shredded Apes Gym. It's
                  up to you to decide for how long you want to send your apes to the gym
                  - you can cancel the staking and receive earned rewards at any given time.
                  Staking 1 ape generates 10 $WHEY per day.<br />
                  If you stake 3 apes, each ape will pump you x1.25 more $WHEY!
                </p>
              </div>
              <div className="landing-content">
                <div className="landing-header">
                  <h2>Webshop</h2>
                  <div className="landing-nft-box">
                    <img
                      src={yellowCheckmarkImage}
                      alt=""
                    />
                  </div>
                </div>
                <p>
                  $WHEY is the official utility token of the Shredded Apes metaverse,
                  providing a way to get access to our product line, which includes
                  nutrition, clothing, in-house services, discounts on secondary NFT
                  collections, in-game decisions and holders access to high-end perks.
                  Most of these utilities will have burning mechanisms in order to
                  reduce the total supply.
                </p>
              </div>
              <div className="landing-content blank">
              </div>
              <div className="landing-content blank">
              </div>
              <div className="landing-content">
                <div className="landing-header">
                  <h2>Bootcamps</h2>
                  <div className="landing-nft-box">
                    <img
                      src={yellowCheckmarkImage}
                      alt=""
                    />
                  </div>
                </div>
                <p>
                  Make your Apes work for you by sending them on a Bootcamp of your choice!
                  The higher the intensity of the bootcamp, the more $WHEY they will earn
                  you.<br />
                  If you decide to send them on our most hard-core Military Bootcamp, you
                  will earn a staggering 2x more $WHEY
                </p>
              </div>
              <div className="landing-content incomplete">
                <div className="landing-header">
                  <h2>DAO</h2>
                  <div className="landing-nft-box">
                    <img
                      src={whiteCheckmarkImage}
                      alt=""
                    />
                  </div>
                </div>
                <p>
                  Our DAO will be a completely community-ran organization that has access
                  to its own funds from a percentage of SAGC royalties. <br />
                  Each team can bring out suggestions and votes will be held on how to
                  direct these funds, work out ideas and bring them to life together.
                </p>
              </div>
              <div className="landing-content blank">
              </div>
              <div className="landing-content blank">
              </div>
              <div className="landing-content incomplete">
                <div className="landing-header">
                  <h2>Juiced Apes</h2>
                  <div className="landing-nft-box">
                    <img
                      src={whiteCheckmarkImage}
                      alt=""
                    />
                  </div>
                </div>
                <p>
                  A bunch of apes have been infected by a faulty vaccine and started mutating...
                  These utterly dangerous, otherworldly looking beasts will be introduced at
                  the end of Q2.<br />
                  The collection will partially be minted through $WHEY and all of it will
                  be fully burned.<br />
                  Unlike our genesis this collection won't stay the same forever...
                </p>
              </div>
              <div className="landing-content incomplete">
                <div className="landing-header">
                  <h2>3D Shredded Apes</h2>
                  <div className="landing-nft-box">
                    <img
                      src={whiteCheckmarkImage}
                      alt=""
                    />
                  </div>
                </div>
                <p>
                  The 3D Shredded Apes collection will come in the form of full body
                  sync avatars which will have endless metaverse utilities.<br />
                  E.g. integrations with other metaverse, creating our own gym with
                  online classes, shopping our own products in a 3D store and much
                  much more...
                </p>
              </div>
              <div className="landing-content blank">
              </div>
              <div className="landing-content blank">
              </div>
              <div className="landing-content incomplete">
                <div className="landing-header">
                  <h2>To be continued</h2>
                  <div className="landing-nft-box">
                    <img
                      src={whiteCheckmarkImage}
                      alt=""
                    />
                  </div>
                </div>
                <p>
                  SAGC is continuously looking to add new utilities and services for the
                  community. So expect this roadmap to grow over time.
                </p>
              </div>
            </div>
          </Container>
        </div>
      </div>
      <Container>
        <div className="landing-team-container">
          <h1 className="section-title">Meet the team</h1>
          <div className="landing-team">
            <div className="landing-member-container">
              <div className={`landing-member-view left ${teamViewer === 0 ? 'main' : ''}`}>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={pengucciImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Pengucci</b></p>
                      <p>Founder</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/Pengucci_"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={chubeImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Chube</b></p>
                      <p>Co-Founder</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/ThaChube_"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={avedionImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Avedion</b></p>
                      <p>Artist</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/avedion_SAGC"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={halsyImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Halseybob</b></p>
                      <p>Marketing Manager</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/Halsy09"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={libertyImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Liberty</b></p>
                      <p>Community Manager</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/sliberty13"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={insiderImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>SolanaInsider</b></p>
                      <p>Social Media Manager</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/SolanaInsider"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`landing-member-view right ${teamViewer === 1 ? 'main' : ''}`}>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={acidbejImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Acidbej</b></p>
                      <p>Tokenomics Expert</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/Acidbej"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={muxmanImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Mux</b></p>
                      <p>Discord Manager</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/shreddedapesNFT"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={jefe1Image}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Jefe</b></p>
                      <p>Event Manager</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/wtfxjeff"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={alexImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>AlexDragon</b></p>
                      <p>Head Developer</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://www.linkedin.com/in/alexey-yamada-1b915122a"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <LinkedInIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member">
                  <div className="landing-member-image">
                    <img
                      src={unknownImage}
                      alt=""
                    />
                  </div>
                  <div className="landing-member-info">
                    <div className="member-name">
                      <p><b>Malik</b></p>
                      <p>Developer</p>
                    </div>
                    <div className="member-social">
                      <a
                        href="https://twitter.com/shreddedapesNFT"
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                      >
                        <TwitterIcon />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="landing-member" style={{ visibility: 'hidden' }}>
                </div>
              </div>
            </div>
            <div className="landing-member-controller">
              <div className="side-btn" onClick={() => { setTeamViewer(0) }}>
                <LeftArrowIcon />
              </div>
              <div className={`radius-btn ${teamViewer === 0 ? 'active' : ''}`} onClick={() => { setTeamViewer(0) }} />
              <div className={`radius-btn ${teamViewer === 1 ? 'active' : ''}`} onClick={() => { setTeamViewer(1) }} />
              <div className="side-btn" onClick={() => { setTeamViewer(1) }}>
                <RightArrowIcon />
              </div>
            </div>
          </div>
        </div>
      </Container>
      <div className="landing-faq-container">
        <Container>
          <h1 className="section-title">FAQ</h1>
          <div className="landing-content">
            <div className="landing-header">
              <h2>Who are the Shredded Apes?</h2>
              <div className="landing-nft-box">
                <img
                  src={yellowDropmarkImage}
                  alt=""
                />
              </div>
            </div>
            <p>
              To cover the cost of the inhumane gas prices the Elite first world order used regular,
              everyday apes to do their daily chores and blockchain mining for ages in the metaverse
              timeline. This has weeded out all the skinny, chicken leg apes and left only the biggest
              and strongest ape slaves alive. Centuries of uprisings and rebellions commenced, leaving
              many apes terrorized and deceased. <br />
              <br />
              A small group of 5000 apes have successfully found their way out of slavery and have fled
              to the Solana blockchain.<br />
              <br />
              After spending 1 year in hiding, surviving solely on protein powder, creatine and
              multivitamins and being constricted to a strict training regime that consisted of doing
              heavyweight lifting and martial art training routines our Apes have now completely
              metamorphosed into Shredded Apes powerful enough to slap any ape into oblivion.
            </p>
          </div>
          <div className="landing-content">
            <div className="landing-header">
              <h2>How many Shredded Apes are there?</h2>
              <div className="landing-nft-box">
                <img
                  src={yellowDropmarkImage}
                  alt=""
                />
              </div>
            </div>
            <p>
              Our genesis collection consists of 5000 unique 1/1 characters who live on the Solana Blockchain.
              They are all hand-drawn, 100% original and randomly generated through script.
            </p>
          </div>
          <div className="landing-content">
            <div className="landing-header">
              <h2>When was the Shredded Apes mint</h2>
              <div className="landing-nft-box">
                <img
                  src={yellowDropmarkImage}
                  alt=""
                />
              </div>
            </div>
            <p>
              Our genesis collection was minted on January 9th 2022.
            </p>
          </div>
          <div className="landing-content">
            <div className="landing-header">
              <h2>How do I buy an NFT?</h2>
              <div className="landing-nft-box">
                <img
                  src={yellowDropmarkImage}
                  alt=""
                />
              </div>
            </div>
            <p>
              All you need are Solana coins, a compatible wallet and our website.
            </p>
          </div>
          <div className="landing-content">
            <div className="landing-header">
              <h2>How do I set up a wallet?</h2>
              <div className="landing-nft-box">
                <img
                  src={yellowDropmarkImage}
                  alt=""
                />
              </div>
            </div>
            <p>
              We recommend using Phantom wallet if you are minting on desktop. For more information
              about how to set up a Phantom wallet visit: help.phantom.app
            </p>
          </div>
          <div className="landing-content">
            <div className="landing-header">
              <h2>How do I add funds to my wallet?</h2>
              <div className="landing-nft-box">
                <img
                  src={yellowDropmarkImage}
                  alt=""
                />
              </div>
            </div>
            <p>
              To add funds to your wallet you will need to buy the Solana coin (SOL). This can be done
              on any exchange wallet (Binance, Coinbase,…).<br />
              <br />
              Next you will need to go to your account created on Phantom, Solflare, Sollet. Click on
              ‘Deposit SOL’ and copy your SOL address which will look something like this: …<br />
              <br />
              Go over to SOL on your exchange wallet and choose ‘Send SOL’. You can now paste the address and send your SOL to your minting wallet.
            </p>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
