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
    // Only check auth status when location changes, and only if state is already loaded from localStorage
    const isAuthRoute =
      location.pathname === "/login" || location.pathname === "/signup";
    if (!state && !isAuthRoute) {
      navigate("/login");
    }
  }, [location.pathname, navigate, state]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/create-post" element={<CreatePost />} />
    </Routes>
  );
};

function App() {
  // Initialize state from localStorage if available
  const initializeState = () => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : initialState;
  };

  const [state, dispatch] = useReducer(reducer, null, initializeState);

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
