import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllGrantInfos } from "../flow/scripts";
import styles from "../styles/Home.module.css";

export default function Home() {
  // Create a state variable for all the GrantInfo structs
  // Initialize it to an empty array
  const [grantInfos, setGrantInfos] = useState([]);

  // Load all the GrantInfo's by running the Cadence script
  // when the page is loaded
  useEffect(() => {
    async function fetchGrants() {
      const grants = await getAllGrantInfos();
      setGrantInfos(grants);
    }

    fetchGrants();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Raise</title>
        <meta name="description" content="Raise" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className='mx-4 my-4 text-2xl text-white font-semibold font-mono'>
        <h1> Registered Grants </h1></div>

        <div className={styles.grantsContainer}>
        {grantInfos.length === 0 ? (
      <div className='mx-4 my-4 text-2xl text-white font-semibold font-mono'>
      <p>You have not registered any FNS Grants yet</p>
              </div>
            ) : (

              
              <div className="grid grid-cols-4 gap-8 my-6 mx-2" >
             { grantInfos.map((di, idx) => (
             
        
        
            <div
              className="block max-w-sm rounded-lg bg-white shadow-lg dark:bg-neutral-800" key={idx}>
              <a href="#!" data-te-ripple-init data-te-ripple-color="light">
                <img
                  className="rounded-t-lg"
                  src={di.imgurl}
                  alt="" />
              </a>
              <div className="p-6">
                <h5
                  className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
                {di.name}
                </h5>
                <p className="mb-1 text-base text-neutral-600 dark:text-neutral-100">
                  By {di.owner}
                </p>
                <p className="mb-4 text-base text-neutral-600 dark:text-neutral-100">
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
        
              ))}
         </div>
            )}
        </div>
      </main>
    </div>
  );
}