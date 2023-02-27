import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { checkIsAvailable, getRentCost,getVaultBalance } from "../flow/scripts";
import { initializeAccount, registerGrant } from "../flow/transactions";
import styles from "../styles/Purchase.module.css";
import {
    renewGrant,
    updateAddressForGrant,
    updateBioForGrant,
  } from "../flow/transactions";
import { useRouter } from "next/router";


// Maintain a constant for seconds per year
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export default function Purchase() {
  // Use the AuthContext to check whether the connected user is initialized or not
  const { isInitialized, checkInit } = useAuth();
  // State Variable to keep track of the grant name the user wants
  const [name, setName] = useState("");
  // State variable to keep track of how many years 
  // the user wants to rent the grant for
  const [years, setYears] = useState(1);
  // State variable to keep track of the cost of this purchase
  const [cost, setCost] = useState(0.0);
  // Loading state
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState("");

  const [bio, setBio] = useState("");

  const [grantInfo, setGrantInfo] = useState();


  const router = useRouter();


  // Function to initialize a user's account if not already initialized
  async function initialize() {
    try {
      const txId = await initializeAccount();
        
      // This method waits for the transaction to be mined (sealed)
      await fcl.tx(txId).onceSealed();
      // Recheck account initialization after transaction goes through
      await checkInit();
      
    } catch (error) {
      console.error(error);
    }
  }

  // Function which calls `registerGrant` 
  async function purchase() {
    try {
      setLoading(true);
      const isAvailable = await checkIsAvailable(name);
      if (!isAvailable) throw new Error("Grant is not available");

      if (years <= 0) throw new Error("You must rent for at least 1 year");
      const duration = (years * SECONDS_PER_YEAR).toFixed(1).toString();
      const txId = await registerGrant(name, duration);
      await fcl.tx(txId).onceSealed();

 
        // const timer =  setTimeout(async() => {
        //     const txId1 = await updateBioForGrant(router.query.nameHash, bio);
        //     await fcl.tx(txId1).onceSealed();
        //     await loadGrantInfo();
        // }, 5000);
        // return () => clearTimeout(timer);
      

    

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }


//   async function updateBio() {
//     try {
//       setLoading(true);

//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }


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


  // Function which calculates cost of purchase as user 
  // updates the name and duration
  async function getCost() {
    if (name.length > 0 && years > 0) {
      const duration = (years * SECONDS_PER_YEAR).toFixed(1).toString();
      const c = await getRentCost(name, duration);
      setCost(c);
    }
  }

  // Call getCost() every time `name` and `years` changes
  useEffect(() => {
    getCost();
  }, [name, years]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Flow Name Service - Purchase</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      {!isInitialized ? (
        <>
          <p>Your account has not been initialized yet</p>
          <button onClick={initialize}>Initialize Account</button>
        </>
      ) : (
        <main className={styles.main}>
          <div className={styles.inputGroup}>
            <span>Name: </span>
            <input
              type="text"
              value={name}
              placeholder="learnweb3"
              onChange={(e) => setName(e.target.value)}
            />
            {/* <span>.fns</span> */}
          </div>
          <div className={styles.inputGroup}>
            <span>Select Categories: </span>
            <input
              list="categories"
              placeholder="Categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            //   multiple
            />
            <datalist id="categories" >
  <option value="Flow Mobile Experience "/>
  <option value="Flow Walletless Onboarding "/>
  <option value="Flow Extending the Ecosystem "/>
</datalist>
            {/* <span>years</span> */}
          </div>
          {/* <div className={styles.inputGroup}>
            <span>Update Bio: </span>
            <input
              type="text"
              placeholder="Lorem ipsum..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            {/* <button onClick={updateBio} disabled={loading}>
              Update
            </button> */}
          {/* </div>  */}
          {/* <div className={styles.inputGroup}>
            <span>Duration: </span>
            <input
              type="number"
              placeholder="1"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
            <span>years</span>
          </div> */}
          <button onClick={purchase}>Create Grant</button>
          <p>Cost: {cost} FLOW</p>
          <p>{loading ? "Loading..." : null}</p>
        </main>
      )}
    </div>
  );
}
