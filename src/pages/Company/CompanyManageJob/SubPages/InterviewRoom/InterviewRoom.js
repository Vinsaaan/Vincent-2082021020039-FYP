import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AreYouSureLeave from "../../../../../components/share/AreYouSureLeave";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhoneSlash,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import "./InterviewRoom.css";

const InterviewRoom = () => {
  useEffect(() => {
    document.title = "Career Interview Room";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    let activeStream;

    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        activeStream = mediaStream; // Keep a local reference to the stream

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    getMedia();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleCamera = async () => {
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMicrophone = () => {
    if (stream) {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsMicMuted(!isMicMuted);
    }
  };

  const confirmEndCall = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsCameraOn(false);
    setIsMicMuted(false);
    setShowConfirmation(false);
    navigate(-1);
  };

  const shareScreen = async () => {
    if (!isScreenShared) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = screenStream;
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        screenStream.getVideoTracks()[0].onended = () => {
          if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
          }
          setIsScreenShared(false);
        };
        setIsScreenShared(true);
      } catch (error) {
        console.error("Error sharing the screen.", error);
      }
    } else {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
      setIsScreenShared(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setChat([...chat, message]);
      setMessage("");
    }
  };

  return (
    <div className="ir-centered-container">
      <div className="ir-interview-room">
        <div className="ir-video-area">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="ir-local-video"
          ></video>
          <div className="ir-controls">
            <button onClick={toggleCamera} className="ir-control-btn">
              {isCameraOn ? (
                <FontAwesomeIcon icon={faVideo} />
              ) : (
                <FontAwesomeIcon icon={faVideoSlash} />
              )}
            </button>
            <button
              onClick={toggleMicrophone}
              className="ir-control-btn mute-call"
            >
              {isMicMuted ? (
                <FontAwesomeIcon icon={faMicrophoneSlash} fixedWidth />
              ) : (
                <FontAwesomeIcon icon={faMicrophone} fixedWidth />
              )}
            </button>
            {/* Updated button to show confirmation dialog */}
            <button
              onClick={() => setShowConfirmation(true)}
              className="ir-control-btn end-call"
            >
              <FontAwesomeIcon icon={faPhoneSlash} />
            </button>
            <button onClick={shareScreen} className="ir-control-btn">
              {isScreenShared ? (
                "Stop Sharing"
              ) : (
                <FontAwesomeIcon icon={faDesktop} />
              )}
            </button>
          </div>
        </div>
        <div className="ir-chat-area">
          <div className="ir-chat-display">
            {chat.map((msg, index) => (
              <div key={index} className="ir-chat-message">
                {msg}
              </div>
            ))}
          </div>
          <form className="ir-chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="ir-chat-input"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="ir-send-button">
              Send
            </button>
          </form>
        </div>
      </div>

      {showConfirmation && (
        <AreYouSureLeave
          show={showConfirmation}
          onConfirm={confirmEndCall}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default InterviewRoom;
