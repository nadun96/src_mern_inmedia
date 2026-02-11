import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";
import M from "materialize-css";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = () => {
    fetch("/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          // alert(data.error);
          M.toast({ html: data.error, classes: "red" });
        } else {
          M.toast({ html: "Registration successful!", classes: "green" });
          navigate("/login");
        }
        // console.log(data);
      })
      .catch((err) => console.error(err));
  };
  return (
    <div className="login-container ">
      <div className="card login-card input-field">
        <h2>Sign Up</h2>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          name="email"
          id="email"
          placeholder="example@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn waves-effect waves-light btn-large #6a1b9a purple darken-3"
          onClick={register}
        >
          Sign Up
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
