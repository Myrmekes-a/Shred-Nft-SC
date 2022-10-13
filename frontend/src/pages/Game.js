import Footer from "../components/Footer";
import Iframe from "react-iframe";

export default function Game() {

  return (
    <div className="partnership-content">
      <Iframe url="https://i.simmer.io/@KiD/flappy-ape"
        width="1920px"
        height="1080px"
        id="myId"
        className="myClassname"
        display="initial"
        position="relative" />
      {/* <iframe src="https://i.simmer.io/@KiD/flappy-ape" style="width:1920px;height:1080px"></iframe> */}
      <Footer />
    </div>
  );
}
