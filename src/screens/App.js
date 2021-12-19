import { useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import ClassroomContext from "../contexts/classroomContext";
import HighlightedMealContext from "../contexts/highlightedMealContext";
import TodayTimetableContext from "../contexts/todayTimetableContext";
import UserContext from "../contexts/userContext";
import useDateUpdate from "../hooks/useDateUpdate";
import axiosInstance from "../utils/axiosInstance";

import Layout from "./Layout";
import Home from "./Home";
import LoginRegister from "./LoginRegister";
import RegisterComplete from "./RegisterComplete";
import Timetable from "./Timetable";
import Meal from "./Meal";
import Schedule from "./Schedule";
import Asked from "./Asked";
import Todo from "./Todo";
import Settings from "./Settings";
import Error404 from "./Error404";
import ModalLoginRegister from "./ModalLoginRegister";

function getLocalStorage(key, defaultValue) {
    if (localStorage.getItem(key)) return JSON.parse(localStorage.getItem(key));
    else localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
}

export default function App() {
    const location = useLocation();
    const state = location.state;

    const isFirstLaunch = useRef(true);

    const [isLogin, setIsLogin] = useState(getLocalStorage("isLogin", false));
    const [user, setUser] = useState(getLocalStorage("user", { id: -1, email: "", nickname: "", profilePic: {}, is_staff: false }));
    const [token, setToken] = useState(getLocalStorage("token", ""));

    const [classroom, setClassroom] = useState(getLocalStorage("classroom", { grade: 2, room: 1 }));

    const setClassroomStorage = (classroom) => {
        localStorage.setItem("classroom", JSON.stringify(classroom));
        setClassroom(classroom);
    };

    const { dateUpdate } = useDateUpdate();

    const [todayTimetable, setTodayTimetable] = useState({});

    const [highlightedMeal, setHighlightedMeal] = useState(getLocalStorage("highlightedMeal", {}));

    const validateToken = useCallback(async () => {
        try {
            const response = await axiosInstance.post("/apis/v2/accounts/validatetoken/", { token: token });
            if (response.data.valid) {
                setUser(response.data.user);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            } else {
                setIsLogin(false);
                setUser({ email: "", nickname: "" });
                setToken("");
                localStorage.setItem("isLogin", JSON.stringify(false));
                localStorage.setItem("user", JSON.stringify({ email: "", nickname: "" }));
                localStorage.setItem("token", "");
            }
        } catch (error) {
            console.error(error);
        }
    }, [token]);
    useEffect(() => {
        if (isFirstLaunch.current) {
            isFirstLaunch.current = false;
            if (isLogin) {
                validateToken();
            }
        }
    }, [isLogin, validateToken]);

    useEffect(() => {
        if (isLogin) {
            async function getTodayTimetable() {
                try {
                    const response = await axiosInstance.get(`/apis/v2/timetable/improvedtimetable/${classroom.grade}/${classroom.room}/today/`);
                    setTodayTimetable(response.data);
                } catch (error) {
                    console.error(error);
                }
            }
            getTodayTimetable();
        }
    }, [dateUpdate, classroom, isLogin]);

    return (
        <UserContext.Provider
            value={{
                isLogin: isLogin,
                user: user,
                token: token,
                setUser: (obj) => {
                    setToken(obj.token);
                    setUser(obj.user);
                    setIsLogin(obj.isLogin);
                    localStorage.setItem("token", JSON.stringify(obj.token));
                    localStorage.setItem("user", JSON.stringify(obj.user));
                    localStorage.setItem("isLogin", JSON.stringify(obj.isLogin));
                },
                setUserInfo: (obj) => {
                    setUser(obj);
                    localStorage.setItem("user", JSON.stringify(obj));
                },
            }}
        >
            <ClassroomContext.Provider value={{ classroom: classroom, setClassroom: setClassroomStorage }}>
                <TodayTimetableContext.Provider value={todayTimetable}>
                    <HighlightedMealContext.Provider
                        value={{
                            highlightedMeal: highlightedMeal,
                            toggleHighlightedMeal: (mealName) => {
                                const newHighlightedMeal = { ...highlightedMeal };
                                newHighlightedMeal[mealName] = !newHighlightedMeal[mealName];
                                setHighlightedMeal(newHighlightedMeal);
                                localStorage.setItem("highlightedMeal", JSON.stringify(newHighlightedMeal));
                            },
                        }}
                    >
                        <Routes location={state?.backgroundLocation || location}>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Home />} />
                                <Route path="/login" element={<LoginRegister defaultTab={0} />} />
                                <Route path="/register" element={<LoginRegister defaultTab={1} />} />
                                <Route path="/register/complete" element={<RegisterComplete />} />
                                <Route path="/timetable" element={<Timetable />} />
                                <Route path="/meal" element={<Meal />} />
                                <Route path="/schedule" element={<Schedule />} />
                                <Route path="/asked" element={<Asked />} />
                                <Route path="/todo" element={<Todo />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="*" element={<Error404 />} />
                            </Route>
                        </Routes>
                        {state?.backgroundLocation && (
                            <Routes>
                                <Route path="/login" element={<ModalLoginRegister defaultTab={0} />} />
                                <Route path="/register" element={<ModalLoginRegister defaultTab={1} />} />
                            </Routes>
                        )}
                    </HighlightedMealContext.Provider>
                </TodayTimetableContext.Provider>
            </ClassroomContext.Provider>
        </UserContext.Provider>
    );
}
