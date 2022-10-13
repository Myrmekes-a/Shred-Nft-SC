import { useEffect, useRef, useState } from "react";
import Container from "../components/Container";
import Footer from "../components/Footer";
import footerImage from '../assets/img/clipper.svg';
import { useWallet } from "@solana/wallet-adapter-react";
import { errorAlert, infoAlert, successAlert } from "../components/toastGroup";
import { SHRED_BACKEND_API_URL } from "../config";

export default function PartnerShip() {
  // ------------page state-----------
  const wallet = useWallet();
  const ref = useRef();
  const [discord, setDiscord] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [poolExist, setPoolExist] = useState(undefined);
  const [token, setToken] = useState('');
  const [collaborating, setCollaborating] = useState(undefined);
  const [product, setProduct] = useState('');
  const [info, setInfo] = useState('');
  const [attachData, setAttachData] = useState({
    name: '',
    ext: '',
    data: '',
  });

  useEffect(() => {
    // eslint-disable-next-line
  }, [wallet.connected])

  const handleSubmit = (e) => {
    if (!discord || discord === '' || discord.lastIndexOf('#') !== discord.length - 5) {
      console.log("discord =>", discord);
      errorAlert('Invalid Discord Name');
      return;
    }
    if (!email || email === '' || !(email.includes('@') && email.includes('.'))) {
      console.log("email =>", email);
      errorAlert('Invalid Email Address');
      return;
    }
    if (!website || website === '' || website.indexOf('http') === -1 || !website.includes('://') || !website.includes('.')) {
      console.log("website =>", website);
      errorAlert('Invalid Website Url');
      return;
    }
    if (!twitter || twitter === '') {
      console.log("twitter =>", twitter);
      errorAlert('Invalid Twitter');
      return;
    }
    if (poolExist === undefined) {
      console.log("poolExist =>", poolExist);
      errorAlert('Invalid PoolExist');
      return;
    }
    if (!token || token === '') {
      console.log("token =>", token);
      errorAlert('Invalid Token');
      return;
    }
    if (collaborating === undefined) {
      console.log("collaborating =>", collaborating);
      errorAlert('Invalid Collaborating');
      return;
    }
    if (collaborating === true && (!product || product === '')) {
      console.log("product =>", product);
      errorAlert('Invalid Product');
      return;
    }
    if (!info) {
      setInfo('');
    }
    
    e.preventDefault();
    console.log('Sending =>');
    let data = {
      discord,
      email,
      website,
      twitter,
      pool_exist: poolExist,
      token,
      collaborating,
      product,
      info,
      attach: attachData.name === '' ? undefined : attachData,
    };
    fetch(SHRED_BACKEND_API_URL + '/api/contact', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((res) => {
      console.log('Response received');
      if (res.status === 200) {
        successAlert('Submit succeeded!');
        setDiscord('');
        setEmail('');
        setWebsite('');
        setTwitter('');
        setPoolExist(undefined);
        setToken('');
        setCollaborating(undefined);
        setProduct('');
        setInfo('');
        setAttachData({
          name: '',
          ext: '',
          data: '',
        });
        ref.current.value = '';
      }
    }).catch((e) => {
      errorAlert(e.message || e.msg || JSON.stringify(e));
    });
  }

  const handleAttach = () => {
    ref.current.click();
  }

  const onAttachChange = async (e) => {
    let fileUrl = e.target.value;
    console.log(e.target.files)
    let strList = fileUrl.split('\\');
    let fileName = strList[strList.length - 1];
    strList = fileName.split('.');
    let ext = '';
    if (strList.length > 0) ext = strList[strList.length - 1];
    console.log(fileName, ext)
    let reader = new FileReader();
    reader.onload = () => {
      setAttachData({
        name: fileName,
        ext,
        data: reader.result,
      })
      infoAlert('Load Attach File Success!');
    };
    reader.onerror = (error) => {
      errorAlert('Error while Loading Attach File!');
      console.log('Attach File Error: ', error);
    };
    reader.readAsDataURL(e.target.files[0]);
  }
  
  return (
    <div className="partnership-content">
      <Container>
        <h2 className="partnership-title">SAGC Brand Partners - <span className="highlight">Webshop Integration</span></h2>
        <p className="">
          SAGC is aiming to become the main Nutrition Brand and Health Consultant across all NFT communities.<br />
          Please fill in the following form if you're interested in becoming an SAGC Brand Partner and getting your
          project's Utility Token listed on our Web3 store. Together we'll make sure your community stays fit, all
          while we provide a deflationary burning mechanism/utility for your token.
        </p>
        <div className="section">
          <h3 className="">Discord contact (User#0000) *</h3>
          <input className="" name="discord" type="text" placeholder="..." value={discord} onChange={(e) => {setDiscord(e.target.value)}}/>
        </div>
        <div className="section">
          <h3 className="">Contact email *</h3>
          <input className="" name="email" type="email" placeholder="..." value={email} onChange={(e) => {setEmail(e.target.value)}} />
        </div>
        <div className="section">
          <h3 className="">Website *</h3>
          <input className="" name="website" type="url" placeholder="..." value={website} onChange={(e) => {setWebsite(e.target.value)}} />
        </div>
        <div className="section">
          <h3 className="">Twitter *</h3>
          <input className="" name="twitter" type="text" placeholder="..." value={twitter} onChange={(e) => {setTwitter(e.target.value)}} />
        </div>
        <div className="section">
          <h3 className="">Does your project have a liquidity pool? *</h3>
          <button className={poolExist === true ? "active" : ""} name="pool-ok" onClick={() => {setPoolExist(true)}}>Yes</button>
          <button className={poolExist === false ? "active" : ""} name="pool-no" onClick={() => {setPoolExist(false)}}>No</button>
        </div>
        { poolExist !== undefined &&
          <div className="section">
            <h3 className="">{
              poolExist === true ? 
              'Please provide your utility token link (Solscan / Coingecko / Serum / Raydium / ...) *'
              :
              'When is your liquidity pool expected to be ready? *'
            }</h3>
            <input className="" name="token" type="text" placeholder="..." value={token} onChange={(e) => {setToken(e.target.value)}} />
          </div>
        }
        <div className="section">
          <h3 className="">Are you interested in collaborating on a product to sell on our webshop? *</h3>
          <p>E.g. if your project is in the cannabis niche we could develop a cbd recovery balm</p>
          <button className={collaborating === true ? "active" : ""} name="collaborating-ok" onClick={() => {setCollaborating(true)}}>Yes</button>
          <button className={collaborating === false ? "active" : ""} name="collaborating-no" onClick={() => {setCollaborating(false)}}>No</button>
        </div>
        { collaborating === true && 
        <div className="section">
          <h3 className="">What product do you have in mind? *</h3>
          <input className="" name="product" type="text" placeholder="..." value={product} onChange={(e) => {setProduct(e.target.value)}} />
        </div>
        }
        <div className="section">
          <h3 className="">Document outlining tokenomics</h3>
          <div className="file" onClick={handleAttach}>
            <span>{"Attach File"}</span>
            <img
              src={footerImage}
              alt=""
            />
          </div>
          <input ref={ref} name="tokenomics" type="file" onChange={onAttachChange}/>
        </div>
        <div className="section">
          <h3 className="">Additional info</h3>
          <textarea className="info" name="info" type="text" placeholder="..." value={info} onChange={(e) => {setInfo(e.target.value)}} />
        </div>
        <div className="section">
          <button className="submit" name="submit" onClick={handleSubmit}>Send it</button>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
