import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
    return (
        <nav>
        <div className ="nav-wrapper white">
        <Link to="/" className="brand-logo">InMedi</Link>
        <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li><Link to="/login">Log In</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/profile">Profile</Link></li>
        </ul>
        </div>
      </nav>
    );
}

export default Navbar;