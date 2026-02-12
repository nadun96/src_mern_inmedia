import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

const Navbar: React.FC = () => {
  const { state, dispatch } = useContext(UserContext);
  const navigate = useNavigate();

  const renderList = () => {
    if (state) {
      return [
        <li key="profile">
          <Link to="/profile">Profile</Link>
        </li>,
        <li key="create-post">
          <Link to="/create-post">Create Post</Link>
        </li>,
        <li key="logout">
          <button
            className="btn #c62828 red darken-3"
            onClick={() => {
              localStorage.clear();
              dispatch({ type: "LOGOUT" });
              navigate("/login");
            }}
          >
            Logout
          </button>
        </li>,
      ];
    } else {
      return [
        <li key="login">
          <Link to="/login">Log In</Link>
        </li>,
        <li key="signup">
          <Link to="/signup">Sign Up</Link>
        </li>,
      ];
    }
  };

  return (
    <nav>
      <div className="nav-wrapper white">
        <Link to="/" className="brand-logo">
          InMedi
        </Link>
        <ul id="nav-mobile" className="right hide-on-med-and-down">
          {renderList()}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
