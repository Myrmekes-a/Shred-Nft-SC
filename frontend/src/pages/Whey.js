import { useEffect } from "react";
import Container from "../components/Container";
import Footer from "../components/Footer";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Whey() {
  // ------------page state-----------
  const wallet = useWallet();

  useEffect(() => {
    // eslint-disable-next-line
  }, [wallet.connected])
  
  return (
    <div className="whitepaper-content">
      <Container>
        <h2 className="whitepaper-title"><span className="highlight">$WHEY</span> Tokenomics Whitepaper</h2>
        <h3 className="">What is <span className="highlight">$WHEY</span>?</h3>
        <p className="">
          $WHEY is the centerpiece of the Shredded Apes Ecosystem.
          The main aim of our token is to bring real world utility in terms of health &amp;
          fitness to the NFT space. We want to make it a standard in purchasing nutrition, activewear,
          online coaching and much more. Through $WHEY we plan to unite health enthusiasts,
          not only in SAGC, but in all other NFT communities as well.
        </p>
      </Container>
      <div className="section">
        <Container>
          <h3 className="">Supply</h3>
          <p className="">
            * Maximum Supply: 100 Million $Whey<br />
            <br />
            * Distributed: 4M $WHEY<br />
            <br />
            * Circulating Supply: 2.5M $WHEY<br />
            <br />
            * Burned Supply: 2M $WHEY<br />
            <br />
            * Current Liquidity Pool: 125K USD<br />
            <br />
            * For the moment the only way to earn daily $WHEY is by Staking Shredded Apes on our website
            or by sending them to one of the <a href="/bootcamp" className="highlight">Bootcamps.</a><br />
            We are currently exploring some move-to-earn concepts to further develop the distribution of $WHEY.<br />
            <br />
            Please note that the above mentioned values are approximates.
          </p>
        </Container>
      </div>
      <div className="section">
        <Container>
          <h3 className="">Shredded Apes</h3>
          <p className="">
            Shredded Apes have a reward system based on rarity: Legendary or Common<br />
            * Common Apes earn 10 $WHEY / day through staking. By sending your Ape on Bootcamp you can
            increase that number to up to 20 $WHEY / day.<br />
            <br />
            * Legendary Apes earn 25 $WHEY / day through staking. By sending your Ape on Bootcamp you can
            increase that number to up to 50 $WHEY / day.<br />
            <br />
            Staking and Bootcamp yields are able to increase by a factor of 1.25x if you decide to stake 3 or
            more apes in one of our vaults.
          </p>
        </Container>
      </div>
      <div className="section">
        <Container>
          <h3 className="">Diamond Collection</h3>
          <p className="">
            Our Diamond collection is an honorary collection made for our top holders. Staking and Bootcamps
            will also apply to this collection.<br />
            * Diamond Collection Apes will earn 30 $WHEY / day through staking. By sending your Diamond Collection
            Ape on Bootcamp you can increase that number to up to 60 $WHEY / day. Diamond Collection
          </p>
        </Container>
      </div>
      <div className="section">
        <Container>
          <h3 className="">Juiced Apes</h3>
          <p className="">
            Juiced Apes will have a reward system based on rarity. The collection is still being developed, so
            we won't be disclosing much information regarding the rarities of Juiced Apes and what their daily
            $WHEY yield will be. All we can say is that it will be much different from our genesis collection.
            This collection will also have an evolution mechanism built in that will increase its initial yield.
          </p>
        </Container>
      </div>
      <div className="section">
        <Container>
          <h3 className="">Having Periods</h3>
          <p className="">
            To assure the longevity of our coin we have decided on the implementation of having periods.<br />
            Below is the exact info on how we plan to integrate this in our updated tokenomics to improve our
            ecosystem.<br />
            Each "having" period will cut the rewards by 1/3 (33.3%).<br />
            <br />
            Havings will take place every 6 months, and the first having is currently planned for September 1st 2022.
          </p>
        </Container>
      </div>
      <div className="section">
        <Container>
          <h3 className="">What Gives <span className="highlight">$WHEY</span> its Value?</h3>
          <p className="">
            With the launch of our Web3 Store, the utility of $Whey is no longer just digital.<br />
            A lot of the value for $WHEY comes from its unique real world use-case, never before have you been
            able to buy physical products of this quality with a coin you earn through staking an NFT. We feel
            this is a key component in its longevity as the value will be partially determined by the demand for
            health &amp; fitness. As we look for further ways to integrate our coin with these types of utilities
            its case will only grow stronger.<br />
            Online sports classes, gym memberships, nutritional advice and more utilities will be able to purchased
            through $WHEY.
          </p>
        </Container>
      </div>
      <div className="section">
        <Container>
          <h3 className=""><span className="highlight">$WHEY</span> - A Deflationary Asset</h3>
          <p className="">
            Currently all our utilities are fully or partially deflationary, even our webshop. Let's dive into it:
            <br /><br /><br />
            <span>Bootcamps:</span> To send your Ape on Bootcamp you'll have to pay a certain amount of $WHEY
            depending on what tier of Bootcamp you choose.<br />
            ALL of the Bootcamp earnings will be burned. At the time of writing we have already burned over 2M
            $WHEY through Bootcamps.
            <br /><br /><br />
            <span>Juiced Apes:</span> Juiced Apes will be (partially) minted through a mechanism that involves
            $WHEY.<br />
            Just like Bootcamps, 100% of $WHEY used to mint a Juiced Ape will be burned.
            <br /><br /><br />
            <span>Webshop:</span> Have you ever heard of a brand that burns its profits? This might be a first timer.<br />
            We are currently burning 100% of $WHEY profits coming in through our Webshop. This means that, theoretically,
            if we end up creating an established brand with returning customers, the $WHEY circulating supply could
            go to NEARLY 0, resulting in a price of NEARLY infinity. Of course this is just theory, but think about it.
            <br /><br /><br />
            <b>Is this Sustainable for the Brand?</b><br />
            Of course this model may raise that question. While we want our holders to benefit from our utilities
            as much as possible, the brand has to make some profit in order to have a sustainable business model.<br />
            The answer to this question lies in the fact that we are also accepting other forms of payments where
            we do in fact take profits. Not only that, but we are currently in the first stages of our brand partner
            program.<br />
            This partner program will enable other utility tokens from other projects to also have access to our Web3
            Store and everything else that comes with it. These tokens won't have the same benefit as $WHEY deos, but
            it will enable the brand to take profits on the sales. 100% of the profits coming from sales made in other
            tokens will be used to further establish the brand and balance out our $WHEY liquidity pool.
            <br /><br /><br />
            <span>Raffle/Auction:</span> We will be hosting 1 raffle and 1 auction at least every month.<br />
            These events will be hosted on our own website. The prizes will range from all sorts of NFT's, Products,
            Currency and much more. You will be able to participate in these events through payment in either $WHEY,
            $SOL or both. The proceeds will then either be burned or be used to buy up $WHEY to be burned.
            <br /><br /><br />
            <span>Staking <span className="highlight">$WHEY</span>:</span> For the staking of $WHEY we will be creating both a mixed
            ($USDC/$WHEY) and a pure $WHEY liquidity pool. The returns will be determined based on time staked:
            the longer the duration of the staking, the bigger your return will be.
          </p>
        </Container>
      </div>
      <div className="section">
        <Container>
          <br /><br /><br />
          <p className="">
            <b>More utilities are currently being developed and will soon be added to this document.</b>
            <br /><br /><br />
            Please note that some of the information in this whitepaper might be subject to change.<br />
            SAGC ensures to only make changes if they benefit the longevity of the project.
          </p>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
