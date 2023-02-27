import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import "../flow/config";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  // Use the AuthContext to get values for the currentUser
  // and helper functions for logIn and logOut
  const { currentUser, logOut, logIn } = useAuth();

  return (
     <nav className=' flex justify-between h-12 text-white bg-gray-900   font-bold' >
        <span className='mx-6 my-2 flex text-blue-400 text-3xl	hover:animate-bounce'><Link href={"/"}>Raise</Link></span>
        <ul className= 'px-2 py-3 flex space-x-10 mx-6'>
    <div className='flex mx-16 '>
      <input className="px-4 h-8  rounded-lg  bg-gray-800 text-gray-400" type="text" placeholder="🔍 Search projects" />
</div>
<div className='ease-in-out delay-50 hover:-translate-y-1 text-xl font-semibold '>
      <Link href="/">Home</Link></div>
<div className='ease-in-out delay-50 hover:-translate-y-1 text-xl font-semibold '>

      <Link href="/purchase">Create Grant</Link></div>
<div className='ease-in-out delay-50 hover:-translate-y-1 text-xl font-semibold '>

      <Link href="/manage">Manage</Link></div>
<div className='ease-in-out delay-50 hover:-translate-y-1 text-xl font-semibold '>

      <Link href="/fund">Fund</Link></div>
<div className='ease-in-out delay-50 hover:-translate-y-1 text-xl font-semibold '>

      <button onClick={currentUser.addr ? logOut : logIn}>
        {currentUser.addr ? `${currentUser.addr}` : "Login"}
      </button></div>
      </ul>
</nav>
  
  );
}