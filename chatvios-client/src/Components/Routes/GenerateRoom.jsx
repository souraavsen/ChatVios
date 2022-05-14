import React from "react";
import { useNavigate } from "react-router-dom";
import { v1 as uuid } from "uuid";

const GenerateRoom = () => {
  const navigate = useNavigate();

  function create() {
    const id = uuid();
    navigate(`/room/${id}`);
  }

  return <button onClick={create}>Create Class</button>;
};

export default GenerateRoom;
