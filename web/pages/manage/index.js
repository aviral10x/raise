import * as fcl from "@onflow/fcl";
import Head from "next/head";
import Link from "next/link";
import {useEffect, useState} from "react";
import Navbar from "../../components/Navbar";
import {useAuth} from "../../contexts/AuthContext";
import {getMyGrantInfos,getFlowBalance} from "../../flow/scripts";
import {initializeAccount} from "../../flow/transactions";
import styles from "../../styles/Manage.module.css";

export default function Home() {
  // Use the AuthContext to track user data
  const { currentUser, isInitialized, checkInit } = useAuth();
  const [grantInfos, setGrantInfos] = useState([]);
  const [bal, setBal] = useState("");


  // Function to initialize the user's account if not already initialized
  async function initialize() {
    try {
      const txId = await initializeAccount();
      await fcl.tx(txId).onceSealed();
      await checkInit();
    } catch (error) {
      console.error(error);
    }
  }

  // Function to fetch the grants owned by the currentUser
  async function fetchMyGrants() {
    try {
      const grants = await getMyGrantInfos(currentUser.addr);
      setGrantInfos(grants);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function fetchBalance() {
    try {
      const balance = await getFlowBalance(currentUser.addr);
setBal(balance);
    } catch (error) {
      console.error(error.message);
    }
  }


  // Load user-owned grants if they are initialized
  // Run if value of `isInitialized` changes
  useEffect(() => {
    if (isInitialized) {
      fetchMyGrants();
    
    }
  }, [isInitialized]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Flow Name Service - Manage</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <button onClick={fetchBalance}>FetchBalance{bal ? bal :"bal"}</button>
      <main className={styles.main}>

      <div className='mx-4 my-4 text-2xl text-white font-semibold font-mono'>
        <h1> Registered Grants </h1></div>

        {!isInitialized ? (
          <>
        <div className='mx-2 my-4 text-xl text-white font-mono'>
            <p>Account not logged in! </p></div>
            <div className ='flex justify-center mx-2 my-4'>
        <div className='px-6 rounded-lg text-2xl text-white bg-blue-600 font-bold my-2'>
            <button onClick={initialize}>Login Account</button>
            </div>
            </div>
          </>
        ) : (
          <div className={styles.grantsContainer}>
            {grantInfos.length === 0 ? (
      <div className='mx-4 my-4 text-2xl text-white font-semibold font-mono'>
            
              <p>You have not registered any FNS Grants yet</p></div>
            ) : (

              
              <div className="grid grid-cols-4 gap-8" >
             { grantInfos.map((di, idx) => (
                <Link href={`/manage/${di.nameHash}`}>
             
        
        
            <div
              className="block max-w-sm rounded-sm bg-gray-900 text-white font-mono my-8 mx-4 hover:bg-green-600" key={idx}>
              <a href="#!" data-te-ripple-init data-te-ripple-color="light">
                <img
                  className="rounded-t-lg"
                  src={di.imgurl}
                  alt="" />
              </a>
              <div className="p-6">
                <h5
                  className="mb-2 text-xl  leading-tight text-neutral-800 dark:text-neutral-50 font-semibold">
                {di.name}
                </h5>
                <p className="mb-1 text-base text-neutral-600 dark:text-neutral-200">
                  By {di.owner}
                </p>
                <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
                  {di.bio.slice(0,64)}...
                </p>
                {/* <div className='flex flex-col pb-2'>
                 
                  <input type="text" placeholder="amount"
                    className='px-4 py-2 focus:outline-none focus:border-[#38E8C6] focus:border-2 bg-gray-800 focus:border rounded-lg'
                    onChange={e => setAmount(e.target.value)} />
                </div>

                <button type="button"
                  className="inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  data-te-ripple-init
                  data-te-ripple-color="light" onClick={async () => {
                    const txId = await sendFlow(di.owner, amount);
                    await fcl.tx(txId).onceSealed();
                  }} >Fund </button> */}

              </div>
            </div>
        
                </Link>
              ))}
         </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}