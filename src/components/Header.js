import { useContext, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import UserContext from "../contexts/userContext";
import Hamburger from "./Hamburger";
import styles from "./Header.module.css";
import HeaderTitle from "./HeaderTitle";

export default function Header({ toggleSidebar }) {
    const { isLogin, user, setUser } = useContext(UserContext);
    const [displayMenu, setDisplayMenu] = useState(false);

    const isMaxWidth600 = useMediaQuery({ maxWidth: "600px" });

    return (
        <header className={styles.header}>
            <div className={styles.hamburgerContainer} onClick={toggleSidebar}>
                <Hamburger />
            </div>
            <HeaderTitle></HeaderTitle>
            <div className={styles.buttonContainer}>
                {isLogin ? (
                    <button
                        onClick={() => {
                            setDisplayMenu(!displayMenu);
                        }}
                        className={styles.button}
                    >
                        {user.nickname}
                    </button>
                ) : (
                    <>
                        {!isMaxWidth600 && (
                            <Link to="/login" className={styles.button}>
                                로그인
                            </Link>
                        )}
                        <Link to="/register" className={styles.primaryButton}>
                            회원가입
                        </Link>
                    </>
                )}
                <div style={displayMenu ? { display: "block" } : {}} className={styles.menu}>
                    <button
                        onClick={() => {
                            setUser({ isLogin: false, user: { email: "", nickname: "" }, token: "" });
                            setDisplayMenu(false);
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </header>
    );
}
