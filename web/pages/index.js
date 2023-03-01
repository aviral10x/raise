import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllGrantInfos ,getFlownsName} from "../flow/scripts";
import styles from "../styles/Home.module.css";
import b from'../public/b.jpg'
import m from'../public/m.png'
import e from'../public/e.jpg'
import Footer from '../components/Footer'

export default function Home() {
  // Create a state variable for all the GrantInfo structs
  // Initialize it to an empty array
  const [grantInfos, setGrantInfos] = useState([]);
  const [name,setName]= useState([]);

  // Load all the GrantInfo's by running the Cadence script
  // when the page is loaded
  useEffect(() => {
    async function fetchGrants() {
      const grants = await getAllGrantInfos();
      setGrantInfos(grants);
    
    }

      // async function getFlowns(url){
      //   const response = await fetch(url);
      //   var data = await response.json();
      //   setName(data.name);
    // }

    fetchGrants();
    // getFlowns();
  }, []);

  // const url = "https://testnet.flowns.org/api/data/address/0xdd5d71a9c7f9e565";



// useEffect(()=> {
//   async function getFlowns(url){
//     const response = await fetch(url);
//     var data = await response.json();
//     setName(data.name);
//     console.log(data)
//     }
//     getFlowns();
// },[])

async function getFlowns(url){
  const response = await fetch(url);
  var data = await response.json();
  setName(data.name);
  console.log(data)}


  return (
    <div className={styles.container}>
      <Head>
        <title>Raise</title>
        <meta name="description" content="Raise" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

  

        

      <div className='grid grid-cols-2'>
        <div className=' flex flex-col=-2'>
      <div className ='my-20 mx-20 transition ease-in-out delay-50 hover:-translate-y-1 hover:scale-105'>
<Image 
src={b}
alt=''
width="400"
height="400"/>
</div>
</div>
<div className=' flex flex-col'>
<div className ='my-20 mx-20 transition ease-in-out delay-50 hover:-translate-y-1 hover:scale-105'>
<Image 
src={m}
alt=''
width="350"
height="400"/>
</div>
</div></div>
<div className ='my-20 mx-20'>
<Image 
src={e}
alt=''
width="1100"
height="400"/>

</div>
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
              className="block max-w-sm rounded-sm bg-gray-900 cursor-pointer font-mono text-white  hover:bg-green-600" key={idx}>
              <a href="#!" data-te-ripple-init data-te-ripple-color="light">
               <img
                  className="rounded-t-lg "
                  src={di.imgurl}
                  alt=""
                  width="300" height="200" />
              </a>
              <div className="p-6 ease-in-out delay-100 hover:-translate-y-1">
                <h5
                  className="mb-2 text-xl  text-white font-semibold">
                {di.name}
                </h5>
                <p className="mb-1 text-base text-neutral-600 dark:text-neutral-100">
                  <p className="text-red-100" onMouseEnter={ async ()=>{ 
const name = await getFlownsName(di.owner);
setName(name);
                  }} >By {name}</p>
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
              {/* <button onClick={getFlowns}>check</button> */}

            </div>
        
              ))}
         </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}