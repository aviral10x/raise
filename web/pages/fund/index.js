import * as fcl from "@onflow/fcl";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { getMyGrantInfos } from "../../flow/scripts";
import { initializeAccount } from "../../flow/transactions";
import styles from "../../styles/Manage.module.css";
import { getAllGrantInfos } from "../../flow/scripts";
import { sendFlow } from "../../flow/transactions";




export default function Home() {
  // Use the AuthContext to track user data
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');

  const [grantInfos, setGrantInfos] = useState([]);
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



  async function transferTokens() {
    try {
      const txId = await sendFlow(di.owner, amount);
      await fcl.tx(txId).onceSealed();
    } catch (error) {
      console.error(error);
    }
  }

  async function fund() {
    try {
      setLoading(true);

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
        <title>Flow Name Service - Manage</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <h1>Your Registered Grants</h1>

        {<>

          {/* <div >
            {
              grantInfos.map((di, idx) => (

                <div className={styles.grantInfo} key={idx}>
                  <Link href={`/fund/${di.id}`}>

                    <p>
                      {di.name}
                    </p>
                  </Link>
                  <p>Owner: {di.owner}</p>
                  <p>Linked Address: {di.address ? di.address : "None"}</p>
                  <p>Bio: {di.bio ? di.bio : "None"}</p>
                  <p>
                    Created At:{" "}
                    {new Date(
                      parseInt(di.createdAt) * 1000
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    Expires At:{" "}
                    {new Date(
                      parseInt(di.expiresAt) * 1000
                    ).toLocaleDateString()}
                  </p>
                  <div className='flex flex-col pb-2'>
                    <label className='text-sm text-[#38E8C6]'>amount</label>
                    <input type="text" placeholder="amount"
                      className='px-4 py-2 focus:outline-none focus:border-[#38E8C6] focus:border-2 bg-gray-800 focus:border rounded-lg'
                      onChange={e => setAmount(e.target.value)} />
                  </div>

                  <button onClick={async () => {
                    const txId = await sendFlow(di.owner, amount);
                    await fcl.tx(txId).onceSealed();
                  }} >Fund </button>

                </div>
              ))
            }
          </div> */}
         <div>
           <div className="grid grid-cols-4 gap-8" >
             { grantInfos.map((di, idx) => (
        
        
            <div
              className="block max-w-sm rounded-lg bg-white shadow-lg dark:bg-neutral-700" key={idx}>
              <a href="#!" data-te-ripple-init data-te-ripple-color="light">
                <img
                  className="rounded-t-lg"
                  src={di.imgurl}
                  alt="" />
              </a>
              <div className="p-6">
              <Link href={`/fund/${di.id}`}>
                <h5
                  className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
                {di.name}
                </h5></Link>
                <p className="mb-1 text-base text-neutral-600 dark:text-neutral-200">
                  By {di.owner}
                </p>
                <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
                  {di.bio.slice(0,64)}...
                </p>
                <div className='flex flex-col pb-2'>
                 
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
                  }} >Fund </button>

              </div>
            </div>
         ))
        } </div>
         </div>
        </>
        }
      </main>
    </div>
  );
}