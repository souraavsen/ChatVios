import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useNavigate, useParams } from "react-router-dom";
import Video from "./Video";
import Icons from "../Icons";

const videoHandeler = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Room = () => {
  const navigate = useNavigate();

  const [peers, setPeers] = useState([]);
  const [handleCamere, setHandleCamere] = useState(false);
  const [handleMic, setHandleMic] = useState(false);
  const [handleShare, setHandleShare] = useState(false);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const senders = useRef([]);
  const userStream = useRef();
  const paramID = useParams();

  useEffect(() => {
    socketRef.current = io.connect("/");
    navigator.mediaDevices
      .getUserMedia({
        video: videoHandeler,
        audio: true,
      })
      .then((stream) => {
        userStream.current = stream;
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join room", paramID.roomID);
        socketRef.current.on("all users", (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => [...users, peer]);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function toggleVideo() {
    const videoTrack = userStream.current
      .getTracks()
      .find((track) => track.kind === "video");
    if (videoTrack.enabled) {
      videoTrack.enabled = false;
    } else {
      videoTrack.enabled = true;
    }
    setHandleCamere(!handleCamere);
  }

  function toggleAudio() {
    const audioTrack = userStream.current
      .getTracks()
      .find((track) => track.kind === "audio");
    if (audioTrack.enabled) {
      audioTrack.enabled = false;
    } else {
      audioTrack.enabled = true;
    }
    setHandleMic(!handleMic);
  }

  function shareScreen() {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
      const screenTrack = stream.getTracks()[0];
      senders.current
        .find((sender) => sender.track.kind === "video")
        .replaceTrack(screenTrack);
      screenTrack.onended = function () {
        senders.current
          .find((sender) => sender.track.kind === "video")
          .replaceTrack(userStream.current.getTracks()[1]);
      };
    });
  }

  return (
    <div className='main_video_container'>
      <video className='video' ref={userVideo} autoPlay playsInline />
      {/* <p>You</p> */}
      {/* <div className='video_container'> */}
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} />;
      })}

      <div className='controller'>
        {handleCamere ? (
          <button
            title='Camera On'
            className='controller_option_off'
            onClick={toggleVideo}
          >
            <Icons.CameraOff />
          </button>
        ) : (
          <button
            title='Camera Off'
            className='controller_option'
            onClick={toggleVideo}
          >
            <Icons.Camera />
          </button>
        )}
        {handleMic ? (
          <button
            title='Mic On'
            className='controller_option_off'
            onClick={toggleAudio}
          >
            <Icons.Mute />
          </button>
        ) : (
          <button
            title='Mute Mic'
            className='controller_option'
            onClick={toggleAudio}
          >
            {" "}
            <Icons.MicOn />
          </button>
        )}

        <button
          title='Share Screen'
          className='controller_option'
          onClick={shareScreen}
        >
          <Icons.Share />
        </button>

        <button
          onClick={() => {
            navigate("/");
          }}
          title='Close'
          className='controller_option end_call'
        >
          <Icons.phoneSlash />
        </button>
      </div>
    </div>
  );
};

export default Room;
