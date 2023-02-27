import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import "../flow/config";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  // Use the AuthContext to get values for the currentUser
  // and helper functions for logIn and logOut
  const { currentUser, logOut, logIn } = useAuth();

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