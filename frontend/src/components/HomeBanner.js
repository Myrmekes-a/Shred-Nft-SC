import { useEffect, useState } from "react";
import SyncLoader from "react-spinners/SyncLoader";
import { useWallet } from "@solana/wallet-adapter-react";

import bannerImage from "../assets/img/whey-token.png";
import coinsImage from "../assets/img/coins.png";
import meatImage from "../assets/img/meat.svg";

import ProcessBar from "./ProcessBar";
import { ClaimButton, PrimaryButton } from "./styleHook";
import { calculateAvailableReward, claimReward, getGlobalState } from "../contexts/helper";
import { calculateAvailableReward as calculateAvailableRewardFromBootCamp, claimReward as claimRewardFromBootCamp, getGlobalState as getGlobalBootCampState } from "../contexts/bootcamp_helper";
import { SHOW_REWARD_FIXED, solConnection } from "../config";

export default function HomeBanner({ forceRender, tagIndex, bootCampIndex, setBootCampIndex, ...props }) {
	const wallet = useWallet();
	const [buying, setBuying] = useState(false);
	const [loading, setLoading] = useState(false);
	const [rewardValue, setRewardValue] = useState(0);
	const [totalGlabalStakedCnt, setTotalGlabalStakedCnt] = useState(0);
	const [hide, setHide] = useState(false);
	const getReward = async () => {
		const now = await getTimestamp();
		if (!now) return;
		const reward = await calculateAvailableReward(wallet.publicKey, now);
		setRewardValue(reward);
	}
	const getBootCampReward = async () => {
		const now = await getTimestamp();
		if (!now) return;
		const reward = await calculateAvailableRewardFromBootCamp(wallet.publicKey, now);
		setRewardValue(reward);
	}
	const getTimestamp = async () => {
		const info = await solConnection.getEpochInfo();
		const now = await solConnection.getBlockTime(info.absoluteSlot);
		return now ?? 0;
	}
	const onClaim = () => {
		if (!tagIndex)
			claimReward(wallet, () => setLoading(true), () => setLoading(false));
		else
			claimRewardFromBootCamp(wallet, () => setLoading(true), () => setLoading(false));
		setHide(!hide);
	}

	const getGlobalStateNFTs = async () => {
		const list = await getGlobalState();
		const bootcamp_list = await getGlobalBootCampState();
		setTotalGlabalStakedCnt(list.totalStakedCount.toNumber() + bootcamp_list.totalStakedCount.toNumber());
	}

	useEffect(() => {
		setBuying(false);
		// eslint-disable-next-line
	}, [bootCampIndex, tagIndex])

	useEffect(() => {
		setBuying(false);
		let intv = -1;
		intv = setInterval(() => {
			getGlobalStateNFTs();
			if (wallet.publicKey !== null) {
				if (!tagIndex) getReward();
				else getBootCampReward();
			};
		}, 5000);
		return () => {
			if (intv !== -1) {
				clearInterval(intv);
			}
		}
		// eslint-disable-next-line
	}, [wallet.connected, hide])

	return (
		<div className="home-banner-container">
			<div className="home-banner">
				<div className={`home-banner-content ${tagIndex && !bootCampIndex ? "bootcamp-banner" : "" }`}>
					{!tagIndex ?
					<>
						<h1>Earn <span>$WHEY</span> By Staking Your Shredded Apes</h1>
						<p>Staking is when your ape is shredding in local Shredded Apes Gym.
							It&apos;s up to you to decide for how long you want to send your apes to the gym -
							you can cancel the staking and receive earned rewards at any given time.</p>
						<ProcessBar value={totalGlabalStakedCnt} forceRender={hide} />
						<p>Staking 1 ape generates 10 $WHEY per day. If you stake 3 apes,
							each ape will pump you x1.25 more $WHEY!</p>
						{wallet.publicKey === null &&
							<div className="home-banner-staking">
								<PrimaryButton className={"active"} style={{margin: "0 5rem 0 0", maxWidth: "22rem"}} disabled={false} onClick={() => {}}>
									Start staking
								</PrimaryButton>
								<img
									src={meatImage}
									alt=""
								/>
							</div>
						}
					</> :
					<>
						{!bootCampIndex &&
						<>
							<h1>Send Your Apes On Bootcamp To Earn More <span>$WHEY</span></h1>
							<p>Make your Apes work for you by sending them on a Bootcamp of your choice! 
								The higher the intensity of the bootcamp, the more $WHEY they will earn you.
								If you decide to send them on our most hard-core Military Bootcamp,
								you will earn a staggering 2x more $WHEY</p>
							<div className={`home-banner-staking ${!buying ? 'active' : ''}`} >
								<PrimaryButton className={"active"} style={{maxWidth: "20rem"}} disabled={false} onClick={() => {setBuying(!buying)}}>
									Buy $WHEY
								</PrimaryButton>
								{buying &&
								<>
									<PrimaryButton className={""} style={{maxWidth: "31rem"}} disabled={false} onClick={() => {
										window.open("https://trade.dexlab.space/#/market/8dUZBSu31bPXa6Ub7JR5FeZfYfZUxCqpZ5DRWYG6m8Wk", "_blank");
									}}>
										Buy $WHEY on Dexlab
									</PrimaryButton>
									<PrimaryButton className={""} style={{maxWidth: "31rem"}} disabled={false} onClick={() => {
										window.open("https://birdeye.so/token/5fTwKZP2AK39LtFN9Ayppu6hdCVKfMGVm79F2EgHCtsi", "_blank");
									}}>
										Buy $WHEY on Birdeye
									</PrimaryButton>
								</>
								}
							</div>
						</>
						}
						{bootCampIndex === 1 &&
						<>
							<h1>CrossFit Bootcamp</h1>
							<p>In this Bootcamp, your Shredded Ape will enter strength and
								conditioning training with a focus on learning functional
								movements such as squats, deadlifts, power cleans,
								and muscle ups.  Does your Ape have what
								It takes to complete the Work Out of the Day? </p>
							<ProcessBar value={totalGlabalStakedCnt} forceRender={hide} />
						</>
						}
						{bootCampIndex === 2 &&
						<>
							<h1>MMA Bootcamp</h1>
							<p>So you think your Shredded Ape is a badass?  Well now is your
								chance to see if your Ape has what it takes to step into the ring
								and prove it.  MMA Bootcamp is a rigorous combination of cardio
								and muscle conditioning with technique training in wrestling,
								grappling, Jujutsu, and striking. </p>
							<ProcessBar value={totalGlabalStakedCnt} forceRender={hide} />
						</>
						}
						{bootCampIndex === 3 &&
						<>
							<h1>Military Bootcamp</h1>
							<p>As stated by David Goggins, if you want to be the best of the best “You have to build calluses on
								your brain just like how you build calluses on your hands. Callus your mind through pain and suffering.”
								In Military Bootcamp your Shredded Ape will learn teamwork, discipline, mental toughness, hand to hand combat,
								and weapons training. This bootcamp will push your Ape to its mental and physical limits and unlock your
								Apes true potential</p>
							<ProcessBar value={totalGlabalStakedCnt} forceRender={hide} />
						</>
						}
					</>
					}
				</div>
				<div className="home-banner-image">
					{wallet.publicKey === null ?
						<>
						{!tagIndex &&
							<img
								src={bannerImage}
								alt=""
							/>
						
						}
						</>
						:
						<>
						{(bootCampIndex || !tagIndex) &&
							<div className="claim-box">
								<div className="claim-title">
									<div className="claim-title-content">
										<p>$WHEY</p>
										<h2>{rewardValue.toFixed(SHOW_REWARD_FIXED)}</h2>
									</div>
									<img
										src={coinsImage}
										alt=""
									/>
								</div>
								<p>Accumulated Rewards Amount</p>
								{bootCampIndex !== 0 && tagIndex && <p>From All Bootcamps</p>}
								<ClaimButton disabled={loading} onClick={() => onClaim()}>
									{!loading ?
										<>
											Claim $WHEY
										</>
										:
										<SyncLoader color="#F3B82F" size={15} />
									}
								</ClaimButton>
							</div>
						}
						</>
					}

				</div>
			</div>
		</div>
	)
}