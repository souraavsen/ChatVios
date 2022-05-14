import "./App.css";
import { Route, Routes } from "react-router-dom";
import GenerateRoom from "./Components/Routes/GenerateRoom";
import Room from "./Components/Room";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path='/' element={<GenerateRoom />} />
        <Route path='/room/:roomID' element={<Room/>} />
      </Routes>
    </div>
  );
}

export default App;
