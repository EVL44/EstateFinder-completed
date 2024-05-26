import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Chat({ chats: initialChats }) {
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [chats, setChats] = useState(
    initialChats.filter((chat) => !chat.deletedBy?.includes(currentUser.id))
  );
  const [chat, setChat] = useState(null);
  const messageEndRef = useRef();
  const decrease = useNotificationStore((state) => state.decrease);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id);
      if (!res.data.seenBy.includes(currentUser.id)) {
        decrease();
      }
      setChat({ ...res.data, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text) return;
    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      setChat((prev) => ({ ...prev, messages: [...prev.messages, res.data] }));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.put("/chats/read/" + chat.id);
      } catch (err) {
        console.log(err);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data) => {
        if (chat.id === data.chatId) {
          setChat((prev) => ({ ...prev, messages: [...prev.messages, data] }));
          read();
        }
      });
    }
    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  const confirmDeleteChat = async () => {
    try {
      await apiRequest.delete("/chats/" + chat.id);
      setChats((prevChats) => prevChats.filter((c) => c.id !== chat.id));
      setChat(null);
      toast.success("Chat deleted successfully!");
      toast.dismiss();

    } catch (err) {
      console.log(err);
      toast.error("Failed to delete chat.");
    }
  };

  const handleDeleteChat = () => {
    toast(
      <div>
        <p>Are you sure you want to delete this chat?</p>
        <div
          style={{
            display: "flex",

            marginTop: "10px",
          }}
        >
          <button
            onClick={confirmDeleteChat}
            style={{
              marginRight: "10px",

              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            No
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
      }
    );
  };

  return (
    <div className="chat">
      <ToastContainer />
      <div className="messages">
        <h1>Messages</h1>
        {chats?.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() => handleOpenChat(c.id, c.receiver)}
          >
            <img src={c.receiver.avatar || "/noavatar.jpg"} alt="" />
            <span>{c.receiver.username}</span>
            <p>{c.lastMessage}</p>
            <img  className="deletechat" src="/images.png" alt="" />
            <a href="https://gounaich.github.io/vedio-call/" target="_blank" rel="noopener noreferrer">
              <img className="callicon" src="/call-icon.png" alt="" />
            </a>
            
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <div className="avatarWrapper">
                <img
                  src={chat.receiver.avatar || "noavatar.jpg"}
                  alt=""
                  onClick={() => setIsDropdownVisible(!isDropdownVisible)} // Toggle dropdown on avatar click
                />
                {isDropdownVisible && (
                  <div className="dropdownMenu" ref={dropdownRef}>
                    <button onClick={handleDeleteChat} className="deleteButton">
                      <img
                        src="/deletered.png"
                        alt="Delete"
                        className="deleteIcon"
                      />
                      Delete Chat
                    </button>
                  </div>
                )}
              </div>
              {chat.receiver.username}
            </div>

            <span className="close" onClick={() => setChat(null)} title="close">
              X
            </span>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className="chatMessage"
                style={{
                  alignSelf:
                    message.userId === currentUser.id
                      ? "flex-end"
                      : "flex-start",
                  textAlign:
                    message.userId === currentUser.id ? "right" : "left",
                }}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;