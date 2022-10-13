import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { getUserPoolAccounts } from "../contexts/helper";
import Container from "../components/Container";

interface UserInfo {
    address: string;
    count: number
}

export default function LeaderBoard() {
    const wallet = useWallet();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getAllNfts = async () => {
        setLoading(true);
        if (wallet.publicKey === null) return;
        const list = await getUserPoolAccounts();
        setLoading(false);
        setUsersList(list)
    }
    useEffect(() => {
        if (wallet.publicKey !== null) {
            getAllNfts();
        }
        // eslint-disable-next-line
    }, [wallet.connected])
    return (
        <div className="leaderboard">
            <Container>
                <h1 className="page-title">Leaderboard</h1>
                <div style={{ paddingBottom: 100 }}>
                    {loading ?
                        <p style={{ fontSize: 40, color: "#fff" }}>Loading...</p>
                        :
                        <>
                            <p style={{ width: 900, display: "flex", color: "#fff", fontSize: 28, justifyContent: "space-between", margin: "5px auto", borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
                                <span style={{ width: 60, textAlign: "center" }}>No</span>
                                <span>Account</span>                                <span style={{ width: 60, textAlign: "center" }}>Apes</span>
                            </p>
                            {usersList.length !== 0 && usersList.reverse().slice(0, 100).map((item: UserInfo, key) => (
                                <p key={key} style={{ width: 900, display: "flex", color: "#fff", fontSize: 24, justifyContent: "space-between", margin: "5px auto" }}>
                                    <span style={{ width: 60, textAlign: "center" }}>{key + 1}</span>
                                    <span>{item.address}</span>
                                    <span style={{ width: 60, textAlign: "center" }}>{item.count}</span>
                                </p>
                            ))}
                        </>
                    }
                </div>
            </Container>
        </div>
    )
}
