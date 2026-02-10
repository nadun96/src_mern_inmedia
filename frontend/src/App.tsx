import './App.css'
import Navbar from './components/Navbar'
import { BrowserRouter , Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import SignUp from './pages/SignUp'

function App() {
  return (
    <BrowserRouter>
    <Navbar />
    <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/profile' element={<Profile />} />
    <Route path='/login' element={<Login />} />
    <Route path='/signup' element={<SignUp />} />
    </Routes>
    </BrowserRouter>
  )
}
export default App;