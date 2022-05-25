import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v1 as uuid } from "uuid";
import Typical from "react-typical";
import logo from "../../assets/Images/chatvios.png";

const GenerateRoom = () => {
  const navigate = useNavigate();
  const [roomTitle, setRoomTitle] = useState("Discussion");

  function create() {
    const id = uuid();
    localStorage.setItem("room_title", JSON.stringify(roomTitle));
    navigate(`/room/${id}.${roomTitle}`);
  }

  return (
    <div className='container'>
      <div className='title'>
        <img src={logo} alt='' />
        <h1>ChatVios</h1>
      </div>
      <div>
        <Typical
          className='typical'
          steps={[
            "Welcome to ChatVios...",
            2000,
            "Sharing Ideas and knowledge, is now more easier",
            200,
            "Simply Create room explore",
            500,
          ]}
          loop={Infinity}
          wrapper='p'
        />
      </div>
      <div className='room_details'>
        <label htmlFor='rname'>Room Name</label>
        <input
          type='text'
          placeholder='Enter Room Name'
          defaultValue='Discussion'
          onChange={(e) => setRoomTitle(e.target.value)}
        ></input>
      </div>
      <div>
        <button className='create_btn' onClick={create}>
          Create Class
        </button>
      </div>
    </div>
  );
};

export default GenerateRoom;
