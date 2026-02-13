import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import M from "materialize-css";
import { UserContext } from "../../context/userContext";
import { Button, Input } from "../atoms";
import api from "../../utils/api";

const Login = () => {
  const { dispatch } = useContext(UserContext);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    if (
      !/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/.test(
        email,
      )
    ) {
      M.toast({ html: "Invalid email format", classes: "red" });
      return;
    }
    api
      .post("/auth/login", { email, password })
      .then(({ data }) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "red" });
        } else {
          localStorage.setItem("jwt", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          dispatch({ type: "USER", payload: data.user });
          M.toast({ html: "Login successful!", classes: "green" });
          navigate("/");
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="login-container ">
      <div className="card login-card input-field">
        <h2>Login</h2>
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="example@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button color="purple" size="large" onClick={login}>
          Login
        </Button>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
