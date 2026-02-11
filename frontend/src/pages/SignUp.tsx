import React from 'react'
import { Link } from 'react-router-dom'

type Props = {}

const SignUp = (props: Props) => {
  return (
    <div className='login-container '>
      <div className='card login-card input-field'>
        <h2>Sign Up</h2>
        <input  type="text" name="name" id="name" placeholder="Your Name" />
        <input  type="email" name="email" id="email" placeholder="example@example.com" />
        <input  type="password" name="password" id="password" placeholder="********" />
        <button className='btn waves-effect waves-light btn-large #6a1b9a purple darken-3'>Sign Up</button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp