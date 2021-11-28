import styles from "./SmallClass.module.css";
import classNames from "classnames/bind";
import { useState } from "react";
import formatTimeString from "../utils/formatTimeString";
import { Link } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { useMediaQuery } from "react-responsive";
const cx = classNames.bind(styles);

export default function SmallClass({ classObj, isRemote, remoteURL, startTime, endTime, replaced = false }) {
    const [open, setOpen] = useState(false);
    const [blockClosed, setBlockClosed] = useState(false);

    const isSmallMobile = useMediaQuery({ query: "(max-width: 320px)" });
    const isMediumMobile = useMediaQuery({ query: "(max-width: 340px)" });

    function toggleOpen(e) {
        if ((e.target.tagName === "DIV") | (e.target.tagName === "SPAN")) {
            setOpen((open) => {
                setBlockClosed(open);
                return !open;
            });
        }
    }
    return (
        <div style={{ backgroundColor: classObj.color }} className={cx(styles.class, { "class--open": open, "class--closed": blockClosed })} onClick={toggleOpen}>
            <div className={styles.head}>
                <div className={styles.startTime}>
                    <div>{formatTimeString(startTime, "hh mm")}</div>
                </div>
                <div className={styles.title}>
                    <span>
                        {isSmallMobile ? classObj.short_name : classObj.name}
                        {replaced && <div className={styles.replaced}>변경됨</div>}
                    </span>
                    {isRemote && remoteURL?.pc && remoteURL?.mobile && (
                        <a className={styles.attendRemote} href={isMobile ? remoteURL.mobile : remoteURL.pc}>
                            원격수업 참가
                        </a>
                    )}
                </div>
            </div>
            <div className={styles.information}>
                <div className={styles.duration}>
                    <span>
                        {isMediumMobile
                            ? `${formatTimeString(startTime, "HH:mm")} ~ ${formatTimeString(endTime, "HH:mm")}`
                            : `${formatTimeString(startTime, "a/p hh:mm")} ~ ${formatTimeString(endTime, "a/p hh:mm")}`}
                    </span>
                    <Link to={`/teacher/${classObj.teacher.id}`}>{classObj.teacher.name}</Link>
                </div>
                <div className={styles.memoContainer}>
                    <button className={styles.memoButton}>메모 추가</button>
                </div>
            </div>
        </div>
    );
}
