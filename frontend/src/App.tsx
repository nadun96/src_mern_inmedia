import "./App.css";
import Navbar from "./components/Navbar";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import CreatePost from "./pages/CreatePost";
import { reducer, initialState } from "./reducers/userReducer.ts";
import { useReducer, useEffect, useContext } from "react";
import { UserContext } from "./context/userContext.ts";

const CustomRouteConfig = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user") || "null");
    if (userInfo) {
      dispatch({ type: "USER", payload: userInfo });
    } else {
      const isAuthRoute =
        location.pathname === "/login" || location.pathname === "/signup";
      if (!isAuthRoute) {
        navigate("/login");
      }
    }
  }, [dispatch, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/create-post" element={<CreatePost />} />
    </Routes>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      dispatch({ type: "USER", payload: JSON.parse(user) });
    }
  }, []);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <Navbar />
        <CustomRouteConfig />
      </BrowserRouter>
    </UserContext.Provider>
  );
}
export default App;
