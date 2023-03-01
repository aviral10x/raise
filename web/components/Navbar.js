import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import "../flow/config";
import styles from "../styles/Navbar.module.css";
// import { getAllGrantInfos ,getFlownsName} from "../flow/scripts";
// import { useEffect, useState } from "react";
import { currentUser } from "@onflow/fcl";





// const [address, setAddress] = useState("");

// export  function getAddress (address){
//   setAddress(address);

// return address
// }

export default function Navbar() {
  // Use the AuthContext to get values for the currentUser
  // and helper functions for logIn and logOut
  const { currentUser, logOut, logIn } = useAuth();
//   const [name,setName]= useState([]);

//   useEffect(()=> {
//     fetchName(currentUser.addr).then((name)=> setName(name))
//    console.log(name)
//    },[])

//   async function fetchName() {
//     try {
//       const name = await getFlownsName(currentUser.addr);
// setName(name);
// console.log(currentUser.addr)
//     } catch (error) {
//       console.error(error.message);
//     }
//   }

  return (
    <>
     <nav className=' flex justify-between h-12 text-green-400 bg-black   font-bold' >
        <span className='mx-20 my-2 flex text-green-400 text-2xl	'><Link href={"/"}>RAISE</Link></span>
        <ul className= 'px-2 py-3 flex space-x-10 mx-12 '>
    {/* <div className='flex mx-16 '> */}
      {/* <input className="px-4 h-8  rounded-lg  bg-gray-800 text-gray-400" type="text" placeholder="🔍 Search projects" /> */}
{/* </div> */}

<div className='hover:text-white delay-50  text-md font-semibold font-mono '>
      <Link href="/">Home</Link></div>
<div className='hover:text-white delay-50  text-md font-semibold font-mono'>

      <Link href="/purchase">Create Grant</Link></div>
<div className='hover:text-white delay-50  text-md font-semibold font-mono'>

      <Link href="/manage">Manage</Link></div>
<div className='hover:text-white delay-50 text-md font-semibold font-mono '>

      <Link href="/fund">Fund</Link></div>
      {/* <div className=' mx-2 my-2 '> */}
      <div className='hover:text-white delay-50  text-md font-semibold bg-green-400 text-black rounded-lg px-3 font-mono' >
      <button>
   <a href="https://raise-niftory.vercel.app/">Login with Niftory</a>
       
      </button></div>
<div className='hover:text-white delay-50  text-md font-semibold bg-green-400 text-black rounded-lg px-3 font-mono' >
      <button onClick={currentUser.addr ? logOut : logIn}>
        {currentUser.addr ? `${currentUser.addr}` : "Login"}
      </button></div>
      
      </ul>
</nav>
{/* <hr/> */}
</>
  
  );
}

