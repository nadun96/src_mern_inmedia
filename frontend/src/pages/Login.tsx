import React from 'react'
import './Login.css'
type Props = {}

const Login = (props: Props) => {
  return (
    <div className='login-container '>
      <div className='card login-card input-field'>
        <h2>Login</h2>
        <input  type="email" name="email" id="email" placeholder="example@example.com" />
        <input  type="password" name="password" id="password" placeholder="********" />
        <button className='btn waves-effect waves-light btn-large #6a1b9a purple darken-3'>Login</button>
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  )
}

export default Login;