// AgentsPage.jsx
import React from "react";
import "./agentsPage.scss";

function AgentsPage() {
  // Dummy agent data
  const agents = [
    {
      id: 1,
      name: "Abdeslam GOUNAICH",
      imageUrl: "/photo.jpg",
      email: "abdeslamgounaich@gmail.com",
      phone: "06 41 55 95 80",
    },
    {
      id: 2,
      name: "AbdelHamid Ben Drif",
      imageUrl: "/Abdelhamid.jpg",
      email: "hamid@gmail.com",
      phone: "06 41 55 95 80",
    },
    {
      id: 3,
      name: "Abdelouahed ID Boubrik",
      imageUrl: "/abdelouahed.png",
      email: "abdo@gmail.com",
      phone: "06 41 55 95 80",
    },
  ];

  const sendMessage = (agentEmail) => {
    window.location.href = `mailto:${agentEmail}`;
  };

  return (
    <div className="agentsPage">
      <div className="agentsContainer">
        <h1 className="title">Our Agents</h1>
        <div className="agentList">
          {agents.map((agent) => (
            <div key={agent.id} className="agentCard">
              <img src={agent.imageUrl} alt={agent.name} />
              <h2>{agent.name}</h2>
              <p className="email">Email: {agent.email}</p>
              <p className="phone">Phone: {agent.phone}</p>
              <button onClick={() => sendMessage(agent.email)}>Contact</button>
            </div>
          ))}
        </div>
      </div>
      <p className="additionalInfo">
        For any inquiries or assistance, feel free to contact one of our agents
        listed above.
      </p>
    </div>
  );
}

export default AgentsPage;