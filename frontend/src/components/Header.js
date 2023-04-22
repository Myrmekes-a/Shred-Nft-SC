import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import logo from "../assets/img/logo.png";
import MenuIcon from "../assets/icons/menu";
import TwitterWhiteIcon from "../assets/icons/twitterWhite";
import OpenseaIcon from "../assets/icons/opensea";
import { PrimaryButton } from "./styleHook";
import Container from "./Container";
import GameBox from "./GameBox";

export default function Header({ SCREEN_WIDTH, dimensions, setBootCampIndex }) {
  const [buying, setBuying] = useState(false);
  const [menuSelected, setMenuSelected] = useState(false);
  const navigate = useNavigate();

  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    document.addEventListener("scroll", scrollHandler);
    return () => {
      document.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  const scrollHandler = () => {
    if (document.documentElement.scrollTop > 250) setMenuSelected(false);
  };

  return (
    <div className="header">
      <Container>
        <div className={`header-content ${menuSelected ? "active" : ""}`}>
          {dimensions.width < SCREEN_WIDTH[3] && (
            <div
              className="menu"
              onClick={() => {
                setMenuSelected(!menuSelected);
              }}
            >
              <MenuIcon />
            </div>
          )}
          <div
            className="logo"
            onClick={() => {
              navigate("/", { replace: true });
            }}
          >
            <img src={logo} alt="shredded ape logo" />
          </div>
          <NavLink
            className={`nav-bar ${
              window.location.pathname === "" ? "active" : ""
            }`}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={`nav-bar ${
              window.location.pathname === "ignition" ? "active" : ""
            }`}
            to="/ignition"
          >
            Ignition
          </NavLink>
          <NavLink
            className={`nav-bar ${
              window.location.pathname === "ignition" ? "active" : ""
            }`}
            to="/rebirth"
          >
            Rebirth
          </NavLink>
          <NavLink
            className={`nav-bar ${
              window.location.pathname === "whey" ? "active" : ""
            }`}
            to="/whey"
          >
            $Whey
          </NavLink>
          <NavLink
            className={`nav-bar ${
              window.location.pathname === "staking" ? "active" : ""
            }`}
            to="/staking"
          >
            Staking
          </NavLink>
          <NavLink
            className={`nav-bar ${
              window.location.pathname === "bootcamp" ? "active" : ""
            }`}
            to="/bootcamp"
            onClick={() => {
              setBootCampIndex(0);
            }}
          >
            BootCamps
          </NavLink>
          {/* <NavLink
            className={`nav-bar ${
              window.location.pathname === "partnership" ? "active" : ""
            }`}
            to="/partnership"
          >
            PartnerShip
          </NavLink> */}
          {/* <a
            className="nav-bar"
            href="https://i.simmer.io/@KiD/flappy-ape"
            target="_blank"
            rel="noreferrer"
          >
            flappy ape
          </a> */}
          {/* <a className="nav-bar" onClick={() => setShowGame(true)}>
            flappy ape
          </a> */}
          {/* <NavLink className={`nav-bar ${window.location.pathname === 'game' ? 'active' : ''}`} to='https://i.simmer.io/@KiD/flappy-ape'>flappy ape</NavLink> */}
          <a
            href="https://www.shreddedapes.shop/"
            target="_blank"
            rel="noreferrer"
            className="nav-bar"
          >
            Store
          </a>
          <div className="header-follow nav-bar">
            <a
              href="https://discord.gg/SGyaVNX3CC"
              target="_blank"
              rel="noreferrer"
              className="social-link"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="36" cy="36" r="36" fill="white" />
                <path
                  d="M55.5595 18.4212C52.0534 16.84 48.2952 15.6713 44.3651 15.0068C44.3301 15 44.2938 15.0044 44.2614 15.0192C44.229 15.0339 44.2019 15.0584 44.184 15.0893C43.7028 15.9349 43.1666 17.0371 42.7908 17.9079C38.6225 17.2852 34.3849 17.2852 30.2167 17.9079C29.7981 16.9428 29.3261 16.0018 28.8028 15.0893C28.7851 15.0581 28.7583 15.033 28.7259 15.0174C28.6936 15.0019 28.6572 14.9966 28.6218 15.0022C24.694 15.6667 20.9358 16.8355 17.4273 18.419C17.3971 18.4316 17.3715 18.4532 17.354 18.4808C10.2225 28.9649 8.26779 39.19 9.22797 49.2868C9.23064 49.3115 9.23832 49.3355 9.25053 49.3571C9.26274 49.3788 9.27924 49.3978 9.29901 49.4129C13.4615 52.4433 18.1041 54.7519 23.0326 56.2418C23.0669 56.2524 23.1037 56.2524 23.138 56.2417C23.1724 56.2311 23.2027 56.2104 23.2251 56.1822C24.2838 54.7614 25.2279 53.2604 26.0346 51.6838C26.0827 51.5922 26.0369 51.4822 25.9406 51.4455C24.4602 50.888 23.0259 50.2153 21.6507 49.4335C21.626 49.4194 21.6052 49.3993 21.5901 49.3752C21.5751 49.3511 21.5662 49.3236 21.5644 49.2952C21.5626 49.2668 21.5679 49.2384 21.5797 49.2125C21.5916 49.1867 21.6097 49.1642 21.6324 49.147C21.9211 48.9339 22.2099 48.7116 22.4849 48.4893C22.5096 48.4693 22.5394 48.4566 22.571 48.4526C22.6026 48.4485 22.6346 48.4533 22.6636 48.4664C31.6627 52.5088 41.4089 52.5088 50.3026 48.4664C50.3317 48.4525 50.3641 48.4471 50.3961 48.4508C50.4281 48.4544 50.4584 48.467 50.4837 48.487C50.7586 48.7116 51.0451 48.9339 51.3361 49.147C51.3591 49.1638 51.3775 49.186 51.3897 49.2117C51.4019 49.2373 51.4076 49.2656 51.4063 49.2939C51.4049 49.3223 51.3965 49.3499 51.3819 49.3743C51.3673 49.3986 51.3468 49.419 51.3224 49.4335C49.952 50.2218 48.5266 50.8886 47.0302 51.4432C47.0072 51.4516 46.9863 51.4647 46.9688 51.4818C46.9513 51.4989 46.9377 51.5195 46.9288 51.5422C46.9199 51.565 46.9159 51.5894 46.9172 51.6138C46.9185 51.6383 46.925 51.6621 46.9363 51.6838C47.7612 53.2582 48.7054 54.7569 49.7435 56.1799C49.765 56.2091 49.7951 56.231 49.8296 56.2425C49.864 56.2539 49.9012 56.2545 49.936 56.2441C54.8729 54.7583 59.5231 52.4487 63.6901 49.4129C63.7105 49.3986 63.7275 49.3802 63.7402 49.3589C63.7528 49.3376 63.7608 49.3138 63.7635 49.2891C64.9093 37.6157 61.8431 27.4731 55.6306 18.4854C55.6154 18.4562 55.5901 18.4334 55.5595 18.4212ZM27.3797 43.1384C24.6711 43.1384 22.4368 40.6887 22.4368 37.6844C22.4368 34.6779 24.6275 32.2304 27.3797 32.2304C30.1526 32.2304 32.3663 34.6985 32.3227 37.6844C32.3227 40.691 30.132 43.1384 27.3797 43.1384V43.1384ZM45.6553 43.1384C42.9443 43.1384 40.7123 40.6887 40.7123 37.6844C40.7123 34.6779 42.9007 32.2304 45.6553 32.2304C48.4281 32.2304 50.6418 34.6985 50.5982 37.6844C50.5982 40.691 48.4304 43.1384 45.6553 43.1384V43.1384Z"
                  fill="#000"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com/shreddedapes"
              target="_blank"
              rel="noreferrer"
              className="social-link"
            >
              <TwitterWhiteIcon />
            </a>
            <a
              href="https://www.instagram.com/shreddedapes/"
              target="_blank"
              rel="noreferrer"
              className="social-link"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="36" cy="36" r="36" fill="white" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M27.2239 13.135C29.6232 13.0245 30.3882 13 36.5 13C42.6118 13 43.3768 13.0266 45.7741 13.135C48.1714 13.2434 49.8077 13.6259 51.2395 14.1802C52.7389 14.7468 54.0991 15.6325 55.2241 16.778C56.3695 17.9009 57.2532 19.2591 57.8177 20.7605C58.3741 22.1923 58.7545 23.8286 58.865 26.2218C58.9755 28.6252 59 29.3902 59 35.5C59 41.6118 58.9734 42.3768 58.865 44.7761C58.7566 47.1693 58.3741 48.8057 57.8177 50.2375C57.2532 51.7391 56.3681 53.0995 55.2241 54.2241C54.0991 55.3695 52.7389 56.2532 51.2395 56.8177C49.8077 57.3741 48.1714 57.7545 45.7782 57.865C43.3768 57.9755 42.6118 58 36.5 58C30.3882 58 29.6232 57.9734 27.2239 57.865C24.8307 57.7566 23.1943 57.3741 21.7625 56.8177C20.261 56.2531 18.9005 55.368 17.7759 54.2241C16.6312 53.1005 15.7454 51.7407 15.1802 50.2395C14.6259 48.8077 14.2455 47.1714 14.135 44.7782C14.0245 42.3748 14 41.6098 14 35.5C14 29.3882 14.0266 28.6232 14.135 26.2259C14.2434 23.8286 14.6259 22.1923 15.1802 20.7605C15.7463 19.2593 16.6327 17.8995 17.778 16.7759C18.901 15.6315 20.2601 14.7457 21.7605 14.1802C23.1923 13.6259 24.8286 13.2455 27.2218 13.135H27.2239ZM45.592 17.185C43.2193 17.0766 42.5075 17.0541 36.5 17.0541C30.4925 17.0541 29.7807 17.0766 27.408 17.185C25.2132 17.2852 24.0227 17.6514 23.2291 17.9602C22.1798 18.3693 21.4291 18.8541 20.6416 19.6416C19.8951 20.3678 19.3206 21.2519 18.9602 22.2291C18.6514 23.0227 18.2852 24.2132 18.185 26.408C18.0766 28.7807 18.0541 29.4925 18.0541 35.5C18.0541 41.5075 18.0766 42.2193 18.185 44.592C18.2852 46.7868 18.6514 47.9773 18.9602 48.7709C19.3202 49.7466 19.895 50.6323 20.6416 51.3584C21.3677 52.105 22.2534 52.6798 23.2291 53.0398C24.0227 53.3486 25.2132 53.7148 27.408 53.815C29.7807 53.9234 30.4905 53.9459 36.5 53.9459C42.5095 53.9459 43.2193 53.9234 45.592 53.815C47.7868 53.7148 48.9773 53.3486 49.7709 53.0398C50.8202 52.6307 51.5709 52.1459 52.3584 51.3584C53.105 50.6323 53.6798 49.7466 54.0398 48.7709C54.3486 47.9773 54.7148 46.7868 54.815 44.592C54.9234 42.2193 54.9459 41.5075 54.9459 35.5C54.9459 29.4925 54.9234 28.7807 54.815 26.408C54.7148 24.2132 54.3486 23.0227 54.0398 22.2291C53.6307 21.1798 53.1459 20.4291 52.3584 19.6416C51.6321 18.8951 50.748 18.3207 49.7709 17.9602C48.9773 17.6514 47.7868 17.2852 45.592 17.185V17.185ZM33.6261 42.4361C35.2311 43.1042 37.0183 43.1944 38.6824 42.6912C40.3464 42.1881 41.7842 41.1228 42.7501 39.6773C43.716 38.2318 44.1501 36.4959 43.9783 34.7659C43.8064 33.0359 43.0393 31.4193 41.808 30.192C41.023 29.4076 40.0738 28.8069 39.0289 28.4333C37.9839 28.0596 36.8691 27.9223 35.7646 28.0313C34.6602 28.1402 33.5937 28.4926 32.6419 29.0632C31.69 29.6338 30.8765 30.4083 30.2599 31.3311C29.6434 32.2538 29.239 33.3017 29.0761 34.3995C28.9131 35.4972 28.9955 36.6174 29.3175 37.6795C29.6394 38.7415 30.1928 39.719 30.9378 40.5415C31.6829 41.364 32.601 42.0111 33.6261 42.4361ZM28.3223 27.3223C29.3962 26.2484 30.6711 25.3965 32.0742 24.8153C33.4774 24.2341 34.9813 23.9349 36.5 23.9349C38.0187 23.9349 39.5226 24.2341 40.9258 24.8153C42.3289 25.3965 43.6038 26.2484 44.6777 27.3223C45.7516 28.3962 46.6035 29.6711 47.1847 31.0742C47.7659 32.4774 48.0651 33.9813 48.0651 35.5C48.0651 37.0187 47.7659 38.5226 47.1847 39.9258C46.6035 41.3289 45.7516 42.6038 44.6777 43.6777C42.5089 45.8466 39.5672 47.0651 36.5 47.0651C33.4328 47.0651 30.4911 45.8466 28.3223 43.6777C26.1534 41.5089 24.9349 38.5672 24.9349 35.5C24.9349 32.4328 26.1534 29.4911 28.3223 27.3223V27.3223ZM50.63 25.6573C50.8961 25.4062 51.1092 25.1043 51.2565 24.7695C51.4039 24.4346 51.4826 24.0736 51.4879 23.7078C51.4932 23.342 51.4251 22.9788 51.2876 22.6398C51.15 22.3008 50.9459 21.9929 50.6872 21.7342C50.4285 21.4755 50.1205 21.2713 49.7815 21.1338C49.4425 20.9963 49.0794 20.9281 48.7136 20.9335C48.3477 20.9388 47.9867 21.0175 47.6519 21.1648C47.317 21.3122 47.0151 21.5252 46.7641 21.7914C46.2759 22.3089 46.0086 22.9964 46.0189 23.7078C46.0293 24.4192 46.3165 25.0986 46.8196 25.6017C47.3227 26.1048 48.0021 26.3921 48.7136 26.4024C49.425 26.4128 50.1124 26.1455 50.63 25.6573V25.6573Z"
                  fill="#000"
                />
              </svg>
            </a>
            <a
              href="https://opensea.io/collection/shredded-apes-gym-club"
              target="_blank"
              rel="noreferrer"
              className="social-link"
            >
              <OpenseaIcon />
            </a>
            <a
              href="https://magiceden.io/marketplace/shredded_apes_gym_club"
              target="_blank"
              rel="noreferrer"
              className="social-link"
            >
              <svg
                version="1.2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 80 48"
                width="48"
                height="32"
              >
                <defs>
                  <image
                    width="81"
                    height="48"
                    id="img1"
                    href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAAwCAMAAABe+Wb7AAAAAXNSR0IB2cksfwAAADZQTFRFAAAA////////////////////////////////////////////////////////////////////8WPG/AAAABJ0Uk5TAABAoMCQIBBgcP/Q4DDwULCA5SH1gAAAAeFJREFUeJytl1m2gyAQRFFwjkT3v9kHT2Pokeac9F+QXLWHsnCu63ofQhjGTo1pzru08MuUNzrX+fWKWQOO21qP1/5P9M/CogCjAZgivah7F7+9SLQ8YY4jEY9yQUIORuC6JiJc4JFv/t9c9JjIIidjEnkihwx2YCoNIVLk2QAMJI8Msm8AxpElQuT0sgOvDueulMiD25BiI1N4XEPHEgvkIj3PyXeuRHyQu/yKkgwIxBs5adO3txEvpAdLqEaR1z+RmJEzWNjwE29TG3H1UMLiTpIQGokociV2NOGcCpiJnq0900OAuMki88nZjNZ7nXjit3oiPq2CdOOoEEmiPlG0M+yotUYUkGUFUMHJa2Mii4SNBwW4TmSQEcwbSiTpckqkSKAJSIBpkzNEjIQCjG5H5YIjQqSWxGqHP9cLpJrE6hR+7/hFaklkxUcgdvvddUO5GSXxVVczkJXsFweYePgVi7yIy0Qa6CtGRaKViJTM9OVSiWieB2mfnYg8JHUAnnEAGtFif6hLUYg2+5PLbyUaLR92ewrR6tBGM9EIzK65HKz3T4jlZLFz2kZMeSxGS2zaTjamKHw+xT0ayhujO2zHuKxGzn2mK2jAhDScQUL2f+4+DZ+CkpTM5Ty00/B5FfYPvcFir78tzsMAAAAASUVORK5CYII="
                  />
                </defs>
                <style></style>
                <use href="#img1" x="-1" y="0" />
              </svg>
            </a>
          </div>
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
          <div className="header-buy-btn">
            {buying && (
              <>
                <PrimaryButton
                  className={"link"}
                  style={{ maxWidth: "31rem" }}
                  disabled={false}
                  onClick={() => {
                    window.open(
                      "https://trade.dexlab.space/#/market/8dUZBSu31bPXa6Ub7JR5FeZfYfZUxCqpZ5DRWYG6m8Wk",
                      "_blank"
                    );
                  }}
                >
                  Buy $WHEY on Dexlab
                </PrimaryButton>
                <PrimaryButton
                  className={"link"}
                  style={{ maxWidth: "31rem" }}
                  disabled={false}
                  onClick={() => {
                    window.open(
                      "https://birdeye.so/token/5fTwKZP2AK39LtFN9Ayppu6hdCVKfMGVm79F2EgHCtsi",
                      "_blank"
                    );
                  }}
                >
                  Buy $WHEY on Birdeye
                </PrimaryButton>
              </>
            )}
            <PrimaryButton
              className={"active"}
              style={{ maxWidth: "20rem" }}
              disabled={false}
              onClick={() => {
                setBuying(!buying);
              }}
            >
              Buy $WHEY
            </PrimaryButton>
          </div>
          {dimensions.width < SCREEN_WIDTH[3] && menuSelected && (
            <div className="header-mobile-nav-bar">
              <div className="header-mobile-nav-bar-content">
                <NavLink
                  className="nav-bar"
                  to="/"
                  onClick={() => {
                    setMenuSelected(false);
                  }}
                >
                  Home
                </NavLink>
                <NavLink
                  className="nav-bar"
                  to="/ignition"
                  onClick={() => {
                    setMenuSelected(false);
                  }}
                >
                  Ignition
                </NavLink>
                <NavLink
                  className="nav-bar"
                  to="/whey"
                  onClick={() => {
                    setMenuSelected(false);
                  }}
                >
                  $Whey
                </NavLink>
                <NavLink
                  className="nav-bar"
                  to="/staking"
                  onClick={() => {
                    setMenuSelected(false);
                  }}
                >
                  Staking
                </NavLink>
                <NavLink
                  className="nav-bar"
                  to="/bootcamp"
                  onClick={() => {
                    setMenuSelected(false);
                    setBootCampIndex(0);
                  }}
                >
                  BootCamps
                </NavLink>
                <NavLink
                  className="nav-bar"
                  to="/partnership"
                  onClick={() => {
                    setMenuSelected(false);
                  }}
                >
                  PartnerShip
                </NavLink>
                <a
                  href="https://www.shreddedapes.shop/"
                  target="_blank"
                  rel="noreferrer"
                  className="nav-bar"
                  onClick={() => {
                    setMenuSelected(false);
                  }}
                >
                  Store
                </a>
                <div className="header-follow nav-bar">
                  <a
                    href="https://magiceden.io/marketplace/shredded_apes_gym_club"
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                  >
                    <svg
                      style={{ width: 45, height: 30 }}
                      version="1.2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 80 48"
                      width="48"
                      height="32"
                    >
                      <defs>
                        <image
                          width="81"
                          height="48"
                          id="img1"
                          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAAwCAMAAABe+Wb7AAAAAXNSR0IB2cksfwAAADZQTFRFAAAA////////////////////////////////////////////////////////////////////8WPG/AAAABJ0Uk5TAABAoMCQIBBgcP/Q4DDwULCA5SH1gAAAAeFJREFUeJytl1m2gyAQRFFwjkT3v9kHT2Pokeac9F+QXLWHsnCu63ofQhjGTo1pzru08MuUNzrX+fWKWQOO21qP1/5P9M/CogCjAZgivah7F7+9SLQ8YY4jEY9yQUIORuC6JiJc4JFv/t9c9JjIIidjEnkihwx2YCoNIVLk2QAMJI8Msm8AxpElQuT0sgOvDueulMiD25BiI1N4XEPHEgvkIj3PyXeuRHyQu/yKkgwIxBs5adO3txEvpAdLqEaR1z+RmJEzWNjwE29TG3H1UMLiTpIQGokociV2NOGcCpiJnq0900OAuMki88nZjNZ7nXjit3oiPq2CdOOoEEmiPlG0M+yotUYUkGUFUMHJa2Mii4SNBwW4TmSQEcwbSiTpckqkSKAJSIBpkzNEjIQCjG5H5YIjQqSWxGqHP9cLpJrE6hR+7/hFaklkxUcgdvvddUO5GSXxVVczkJXsFweYePgVi7yIy0Qa6CtGRaKViJTM9OVSiWieB2mfnYg8JHUAnnEAGtFif6hLUYg2+5PLbyUaLR92ewrR6tBGM9EIzK65HKz3T4jlZLFz2kZMeSxGS2zaTjamKHw+xT0ayhujO2zHuKxGzn2mK2jAhDScQUL2f+4+DZ+CkpTM5Ty00/B5FfYPvcFir78tzsMAAAAASUVORK5CYII="
                        />
                      </defs>
                      <style></style>
                      <use href="#img1" x="-1" y="0" />
                    </svg>
                  </a>
                  <a
                    href="https://discord.gg/SGyaVNX3CC"
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 72 72"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="36" cy="36" r="36" fill="white" />
                      <path
                        d="M55.5595 18.4212C52.0534 16.84 48.2952 15.6713 44.3651 15.0068C44.3301 15 44.2938 15.0044 44.2614 15.0192C44.229 15.0339 44.2019 15.0584 44.184 15.0893C43.7028 15.9349 43.1666 17.0371 42.7908 17.9079C38.6225 17.2852 34.3849 17.2852 30.2167 17.9079C29.7981 16.9428 29.3261 16.0018 28.8028 15.0893C28.7851 15.0581 28.7583 15.033 28.7259 15.0174C28.6936 15.0019 28.6572 14.9966 28.6218 15.0022C24.694 15.6667 20.9358 16.8355 17.4273 18.419C17.3971 18.4316 17.3715 18.4532 17.354 18.4808C10.2225 28.9649 8.26779 39.19 9.22797 49.2868C9.23064 49.3115 9.23832 49.3355 9.25053 49.3571C9.26274 49.3788 9.27924 49.3978 9.29901 49.4129C13.4615 52.4433 18.1041 54.7519 23.0326 56.2418C23.0669 56.2524 23.1037 56.2524 23.138 56.2417C23.1724 56.2311 23.2027 56.2104 23.2251 56.1822C24.2838 54.7614 25.2279 53.2604 26.0346 51.6838C26.0827 51.5922 26.0369 51.4822 25.9406 51.4455C24.4602 50.888 23.0259 50.2153 21.6507 49.4335C21.626 49.4194 21.6052 49.3993 21.5901 49.3752C21.5751 49.3511 21.5662 49.3236 21.5644 49.2952C21.5626 49.2668 21.5679 49.2384 21.5797 49.2125C21.5916 49.1867 21.6097 49.1642 21.6324 49.147C21.9211 48.9339 22.2099 48.7116 22.4849 48.4893C22.5096 48.4693 22.5394 48.4566 22.571 48.4526C22.6026 48.4485 22.6346 48.4533 22.6636 48.4664C31.6627 52.5088 41.4089 52.5088 50.3026 48.4664C50.3317 48.4525 50.3641 48.4471 50.3961 48.4508C50.4281 48.4544 50.4584 48.467 50.4837 48.487C50.7586 48.7116 51.0451 48.9339 51.3361 49.147C51.3591 49.1638 51.3775 49.186 51.3897 49.2117C51.4019 49.2373 51.4076 49.2656 51.4063 49.2939C51.4049 49.3223 51.3965 49.3499 51.3819 49.3743C51.3673 49.3986 51.3468 49.419 51.3224 49.4335C49.952 50.2218 48.5266 50.8886 47.0302 51.4432C47.0072 51.4516 46.9863 51.4647 46.9688 51.4818C46.9513 51.4989 46.9377 51.5195 46.9288 51.5422C46.9199 51.565 46.9159 51.5894 46.9172 51.6138C46.9185 51.6383 46.925 51.6621 46.9363 51.6838C47.7612 53.2582 48.7054 54.7569 49.7435 56.1799C49.765 56.2091 49.7951 56.231 49.8296 56.2425C49.864 56.2539 49.9012 56.2545 49.936 56.2441C54.8729 54.7583 59.5231 52.4487 63.6901 49.4129C63.7105 49.3986 63.7275 49.3802 63.7402 49.3589C63.7528 49.3376 63.7608 49.3138 63.7635 49.2891C64.9093 37.6157 61.8431 27.4731 55.6306 18.4854C55.6154 18.4562 55.5901 18.4334 55.5595 18.4212ZM27.3797 43.1384C24.6711 43.1384 22.4368 40.6887 22.4368 37.6844C22.4368 34.6779 24.6275 32.2304 27.3797 32.2304C30.1526 32.2304 32.3663 34.6985 32.3227 37.6844C32.3227 40.691 30.132 43.1384 27.3797 43.1384V43.1384ZM45.6553 43.1384C42.9443 43.1384 40.7123 40.6887 40.7123 37.6844C40.7123 34.6779 42.9007 32.2304 45.6553 32.2304C48.4281 32.2304 50.6418 34.6985 50.5982 37.6844C50.5982 40.691 48.4304 43.1384 45.6553 43.1384V43.1384Z"
                        fill="#000"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/shreddedapes"
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                  >
                    <TwitterWhiteIcon />
                  </a>
                  <a
                    href="https://www.instagram.com/shreddedapes/"
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 72 72"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="36" cy="36" r="36" fill="white" />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M27.2239 13.135C29.6232 13.0245 30.3882 13 36.5 13C42.6118 13 43.3768 13.0266 45.7741 13.135C48.1714 13.2434 49.8077 13.6259 51.2395 14.1802C52.7389 14.7468 54.0991 15.6325 55.2241 16.778C56.3695 17.9009 57.2532 19.2591 57.8177 20.7605C58.3741 22.1923 58.7545 23.8286 58.865 26.2218C58.9755 28.6252 59 29.3902 59 35.5C59 41.6118 58.9734 42.3768 58.865 44.7761C58.7566 47.1693 58.3741 48.8057 57.8177 50.2375C57.2532 51.7391 56.3681 53.0995 55.2241 54.2241C54.0991 55.3695 52.7389 56.2532 51.2395 56.8177C49.8077 57.3741 48.1714 57.7545 45.7782 57.865C43.3768 57.9755 42.6118 58 36.5 58C30.3882 58 29.6232 57.9734 27.2239 57.865C24.8307 57.7566 23.1943 57.3741 21.7625 56.8177C20.261 56.2531 18.9005 55.368 17.7759 54.2241C16.6312 53.1005 15.7454 51.7407 15.1802 50.2395C14.6259 48.8077 14.2455 47.1714 14.135 44.7782C14.0245 42.3748 14 41.6098 14 35.5C14 29.3882 14.0266 28.6232 14.135 26.2259C14.2434 23.8286 14.6259 22.1923 15.1802 20.7605C15.7463 19.2593 16.6327 17.8995 17.778 16.7759C18.901 15.6315 20.2601 14.7457 21.7605 14.1802C23.1923 13.6259 24.8286 13.2455 27.2218 13.135H27.2239ZM45.592 17.185C43.2193 17.0766 42.5075 17.0541 36.5 17.0541C30.4925 17.0541 29.7807 17.0766 27.408 17.185C25.2132 17.2852 24.0227 17.6514 23.2291 17.9602C22.1798 18.3693 21.4291 18.8541 20.6416 19.6416C19.8951 20.3678 19.3206 21.2519 18.9602 22.2291C18.6514 23.0227 18.2852 24.2132 18.185 26.408C18.0766 28.7807 18.0541 29.4925 18.0541 35.5C18.0541 41.5075 18.0766 42.2193 18.185 44.592C18.2852 46.7868 18.6514 47.9773 18.9602 48.7709C19.3202 49.7466 19.895 50.6323 20.6416 51.3584C21.3677 52.105 22.2534 52.6798 23.2291 53.0398C24.0227 53.3486 25.2132 53.7148 27.408 53.815C29.7807 53.9234 30.4905 53.9459 36.5 53.9459C42.5095 53.9459 43.2193 53.9234 45.592 53.815C47.7868 53.7148 48.9773 53.3486 49.7709 53.0398C50.8202 52.6307 51.5709 52.1459 52.3584 51.3584C53.105 50.6323 53.6798 49.7466 54.0398 48.7709C54.3486 47.9773 54.7148 46.7868 54.815 44.592C54.9234 42.2193 54.9459 41.5075 54.9459 35.5C54.9459 29.4925 54.9234 28.7807 54.815 26.408C54.7148 24.2132 54.3486 23.0227 54.0398 22.2291C53.6307 21.1798 53.1459 20.4291 52.3584 19.6416C51.6321 18.8951 50.748 18.3207 49.7709 17.9602C48.9773 17.6514 47.7868 17.2852 45.592 17.185V17.185ZM33.6261 42.4361C35.2311 43.1042 37.0183 43.1944 38.6824 42.6912C40.3464 42.1881 41.7842 41.1228 42.7501 39.6773C43.716 38.2318 44.1501 36.4959 43.9783 34.7659C43.8064 33.0359 43.0393 31.4193 41.808 30.192C41.023 29.4076 40.0738 28.8069 39.0289 28.4333C37.9839 28.0596 36.8691 27.9223 35.7646 28.0313C34.6602 28.1402 33.5937 28.4926 32.6419 29.0632C31.69 29.6338 30.8765 30.4083 30.2599 31.3311C29.6434 32.2538 29.239 33.3017 29.0761 34.3995C28.9131 35.4972 28.9955 36.6174 29.3175 37.6795C29.6394 38.7415 30.1928 39.719 30.9378 40.5415C31.6829 41.364 32.601 42.0111 33.6261 42.4361ZM28.3223 27.3223C29.3962 26.2484 30.6711 25.3965 32.0742 24.8153C33.4774 24.2341 34.9813 23.9349 36.5 23.9349C38.0187 23.9349 39.5226 24.2341 40.9258 24.8153C42.3289 25.3965 43.6038 26.2484 44.6777 27.3223C45.7516 28.3962 46.6035 29.6711 47.1847 31.0742C47.7659 32.4774 48.0651 33.9813 48.0651 35.5C48.0651 37.0187 47.7659 38.5226 47.1847 39.9258C46.6035 41.3289 45.7516 42.6038 44.6777 43.6777C42.5089 45.8466 39.5672 47.0651 36.5 47.0651C33.4328 47.0651 30.4911 45.8466 28.3223 43.6777C26.1534 41.5089 24.9349 38.5672 24.9349 35.5C24.9349 32.4328 26.1534 29.4911 28.3223 27.3223V27.3223ZM50.63 25.6573C50.8961 25.4062 51.1092 25.1043 51.2565 24.7695C51.4039 24.4346 51.4826 24.0736 51.4879 23.7078C51.4932 23.342 51.4251 22.9788 51.2876 22.6398C51.15 22.3008 50.9459 21.9929 50.6872 21.7342C50.4285 21.4755 50.1205 21.2713 49.7815 21.1338C49.4425 20.9963 49.0794 20.9281 48.7136 20.9335C48.3477 20.9388 47.9867 21.0175 47.6519 21.1648C47.317 21.3122 47.0151 21.5252 46.7641 21.7914C46.2759 22.3089 46.0086 22.9964 46.0189 23.7078C46.0293 24.4192 46.3165 25.0986 46.8196 25.6017C47.3227 26.1048 48.0021 26.3921 48.7136 26.4024C49.425 26.4128 50.1124 26.1455 50.63 25.6573V25.6573Z"
                        fill="#000"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://opensea.io/collection/shredded-apes-gym-club"
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                  >
                    <OpenseaIcon />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
      <GameBox opened={showGame} onClose={() => setShowGame(false)} />
    </div>
  );
}
