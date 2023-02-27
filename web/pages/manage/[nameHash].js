import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as fcl from "@onflow/fcl";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import { getGrantInfoByNameHash, getRentCost } from "../../flow/scripts";
import styles from "../../styles/ManageGrant.module.css";
import {
  renewGrant,
  updateAddressForGrant,
  updateBioForGrant,sendFlow,updateImgUrlForGrant
} from "../../flow/transactions";

// constant representing seconds per year
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export default function ManageGrant() {
  // Use AuthContext to gather data for current user
  const { currentUser, isInitialized } = useAuth();

  // Next Router to get access to `nameHash` query parameter
  const router = useRouter();
  // State variable to store the GrantInfo
  const [grantInfo, setGrantInfo] = useState();
  // State variable to store the bio given by user
  const [bio, setBio] = useState("");
  const [imgurl, setImgUrl] = useState("");

  // State variable to store the address given by user
  const [linkedAddr, setLinkedAddr] = useState("");
  // State variable to store how many years to renew for
  const [renewFor, setRenewFor] = useState(1);
  // Loading state
  const [loading, setLoading] = useState(false);
  // State variable to store cost of renewal
  const [cost, setCost] = useState(0.0);
  const [years, setYears] = useState("");

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');


    
  // Function to load the grant info
  async function loadGrantInfo() {
    try {
      const info = await getGrantInfoByNameHash(
        currentUser.addr,
        router.query.nameHash
      );
      console.log(info);
      setGrantInfo(info);
    } catch (error) {
      console.error(error);
    }
  }

  async function transferTokens() {
    try {
      const txId = await sendFlow(recipient, amount);
      await fcl.tx(txId).onceSealed();
    } catch (error) {
      console.error(error);
    }
  }


  // Function which updates the bio transaction
  async function updateBio() {
    try {
      setLoading(true);
      const txId = await updateBioForGrant(router.query.nameHash, bio);
      await fcl.tx(txId).onceSealed();
      await loadGrantInfo();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }


  async function updateImgUrl() {
    try {
      setLoading(true);
      const txId = await updateImgUrlForGrant(router.query.nameHash, imgurl);
      await fcl.tx(txId).onceSealed();
      await loadGrantInfo();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function which updates the address transaction
  async function updateAddress() {
    try {
      setLoading(true);
      const txId = await updateAddressForGrant(
        router.query.nameHash,
        linkedAddr
      );
      await fcl.tx(txId).onceSealed();
      await loadGrantInfo();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function which runs the renewal transaction
  async function renew() {
    try {
      setLoading(true);
      if (renewFor <= 0)
        throw new Error("Must be renewing for at least one year");
      const duration = (renewFor * SECONDS_PER_YEAR).toFixed(1).toString();
      const txId = await renewGrant(
        grantInfo.name.replace(".fns", ""),
        duration
      );
      await fcl.tx(txId).onceSealed();
      await loadGrantInfo();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function which calculates cost of renewal
  async function getCost() {
    if (grantInfo && grantInfo.name.replace(".fns", "").length > 0 && renewFor > 0) {
      const duration = (renewFor * SECONDS_PER_YEAR).toFixed(1).toString();
      const c = await getRentCost(
        grantInfo.name.replace(".fns", ""),
        duration
      );
      setCost(c);
    }
  }

  // Load grant info if user is initialized and page is loaded
  useEffect(() => {
    if (router && router.query && isInitialized) {
      loadGrantInfo();
    }
  }, [router]);

  // Calculate cost everytime grantInfo or duration changes
  useEffect(() => {
    getCost();
  }, [grantInfo, renewFor]);

  if (!grantInfo) return null;

  return (
    <div className={styles.container}>
      <Head>
        <title>Flow Name Service - Manage Grant</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <div className='flex bg-gray-900 rounded-lg shadow-lg px-5 py-7 flex-col space-y-5 w-1/3'>
              <div className='flex justify-between'>
                <h1 className='text-lg font-semibold text-gray-100 mb-2'>Transfer Tokens</h1>
                <img src='/planee.png' alt='plane' />
              </div>
              <div className='flex flex-col'>
                <label className='text-sm text-[#38E8C6]'>address</label>
                <input type="text" placeholder="recipient address"
                  className='px-4 py-2 focus:outline-none focus:border-[#38E8C6] focus:border-2 bg-gray-800 focus:border rounded-lg'
                  onChange={e => setRecipient(e.target.value)} />
              </div>
              <div className='flex flex-col pb-2'>
                <label className='text-sm text-[#38E8C6]'>amount</label>
                <input type="text" placeholder="amount"
                  className='px-4 py-2 focus:outline-none focus:border-[#38E8C6] focus:border-2 bg-gray-800 focus:border rounded-lg'
                  onChange={e => setAmount(e.target.value)} />
              </div>
              <button onClick={() => transferTokens(amount, recipient)}
                className='rounded-lg text-center text-sm font-bold text-blue-900 py-2 bg-[#38E8C6]'
              >Transfer Tokens</button>
            </div>

      <main className={styles.main}>
        <div>
          <h1>{grantInfo.name}</h1>
          <p>ID: {grantInfo.id}</p>
          <p>Owner: {grantInfo.owner}</p>
          <p>
            Created At:{" "}
            {new Date(
              parseInt(grantInfo.createdAt) * 1000
            ).toLocaleDateString()}
          </p>
          <p>
            Expires At:{" "}
            {new Date(
              parseInt(grantInfo.expiresAt) * 1000
            ).toLocaleDateString()}
          </p>
          <hr />
          <p>Bio: {grantInfo.bio ? grantInfo.bio : "Not Set"}</p>
          <p>Address: {grantInfo.address ? grantInfo.address : "Not Set"}</p>
        </div>

        <div>
          <h1>Update</h1>
          <div className={styles.inputGroup}>
            <span>Update Bio: </span>
            <input
              type="text"
              placeholder="Lorem ipsum..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <button onClick={updateBio} disabled={loading}>
              Update
            </button>
          </div>
          <div className={styles.inputGroup}>
            <span>Update ImgUrl: </span>
            <input
              type="text"
              placeholder="Lorem ipsum..."
              value={imgurl}
              onChange={(e) => setImgUrl(e.target.value)}
            />
            <button onClick={updateImgUrl} disabled={loading}>
              Update
            </button>
          </div>
          <br />

 <div className={styles.inputGroup}>
            <span>Fund: </span>
            <input
              type="number"
              placeholder="1"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
            <span>years</span>
          </div> 
          {/* <div className={styles.inputGroup}>
            <span>Update Address: </span>
            <input
              type="text"
              placeholder="0xabcdefgh"
              value={linkedAddr}
              onChange={(e) => setLinkedAddr(e.target.value)}
            />
            <button onClick={updateAddress} disabled={loading}>
              Update
            </button>
          </div> */}

          {/* <h1>Renew</h1>
          <div className={styles.inputGroup}>
            <input
              type="number"
              placeholder="1"
              value={renewFor}
              onChange={(e) => setRenewFor(e.target.value)}
            />
            <span> years</span>
            <button onClick={renew} disabled={loading}>
              Renew Grant
            </button>
          </div>
          <p>Cost: {cost} FLOW</p>
          {loading && <p>Loading...</p>} */}
        </div>
      </main>
    </div>
  );
}
