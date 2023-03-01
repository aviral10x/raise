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
    <div className={styles.navbar}>
      <Link href="/">Home</Link>
      <Link href="/purchase">Create Grant</Link>
      <Link href="/manage">Manage</Link>
      <Link href="/fund">Fund</Link>
      <button onClick={currentUser.addr ? logOut : logIn}>
        {currentUser.addr ? `${currentUser.addr}` : "Login"}
      </button>
    </div>
  );
}

