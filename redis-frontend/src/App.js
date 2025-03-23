import Signin from './signin';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route } from "react-router-dom";
import Mainapp from './mainapp';
import ProtectedRoute from "./ProtectedRoute";


const API_URL = 'http://localhost:5000/students';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Signin />} />
      <Route 
        path="/mainapp" 
        element={
          <ProtectedRoute>
            <Mainapp />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;