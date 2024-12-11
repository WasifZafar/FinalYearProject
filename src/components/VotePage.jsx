import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, getDoc, updateDoc, doc, query, where } from "firebase/firestore";
import './votepage.css';


const VotePage = () => {
  const [parties, setParties] = useState([]);
  const [registeredElectors, setRegisteredElectors] = useState([]);
  const [electorId, setElectorId] = useState("");
  const [electorDetails, setElectorDetails] = useState(null);
  const [hasVote, setHasVote] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [electionKey, setElectionKey] = useState(""); 

  useEffect(() => {
    // Fetch parties and electors based on the election key
    const fetchElectionData = async () => {
      if (!electionKey) return;

      // Fetch parties for the specific election
      const partyQuery = query(collection(db, "parties"), where("key", "==", electionKey));
      const partyCollection = await getDocs(partyQuery);
      setParties(partyCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      // Fetch registered electors for the specific election
      const electorQuery = query(collection(db, "electors"), where("key", "==", electionKey));
      const electorCollection = await getDocs(electorQuery);
      setRegisteredElectors(electorCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchElectionData();
  }, [electionKey]);

  const handleElectorIdChange = async (e) => {
    const enteredElectorId = e.target.value;
    setElectorId(enteredElectorId);

    const elector = registeredElectors.find((elector) => elector.id === enteredElectorId);
    if (!elector) {
      setElectorDetails(null); // Elector not found
      return;
    }

    // Fetch elector details from Firestore
    const electorDoc = await getDoc(doc(db, "electors", enteredElectorId));
    if (electorDoc.exists()) {
      setElectorDetails(electorDoc.data());
      setHasVote(electorDoc.data()?.hasVote || false); // Check if the elector has voted
    } else {
      setElectorDetails(null);
    }
  };

  const handleVote = async (partyId) => {
    if (hasVote) {
      alert("You have already voted. You can only vote once.");
      return;
    }

    if (!electorDetails) {
      alert("Somthing Wrong!");
      return;
    }

    try {
      // Update the vote count for the selected party
      const partyDoc = doc(db, "parties", partyId);
      const partySnapshot = await getDoc(partyDoc);
      const currentVotes = partySnapshot.data().votes || 0;

      await updateDoc(partyDoc, { votes: currentVotes + 1 });

      // Mark the elector as having voted
      const electorDoc = doc(db, "electors", electorId);
      await updateDoc(electorDoc, { hasVote: true });

      setHasVote(true);
      setShowPopup(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowPopup(false);
        setElectorId("");
        setElectorDetails(null);
        setHasVote(false);
      }, 3000);
    } catch (error) {
      alert("Error casting vote: " + error.message);
    }
  };

  return (
    <div className="vote-box">
      <h2>Vote for Your Preferred Party</h2>

      {/* Input for Election Key */}
      <div>
        <label htmlFor="electionKey">Enter Election Key:</label>
        <input
          type="password"
          id="electionKey"
          value={electionKey}
          onChange={(e) => setElectionKey(e.target.value)}
          required
        />
      </div>

      {/* Input for Elector ID */}
      {electionKey && (
        <div>
          <label htmlFor="electorId">Enter Your Elector ID:</label>
          <input
            type="text"
            id="electorId"
            value={electorId}
            onChange={handleElectorIdChange}
            required
          />
        </div>
      )}

      {/* Display Elector Details */}
      {electorDetails ? (
        <div className="elector-profile">
           <img src={electorDetails.imageUrl} alt={electorDetails.name} width="110" height="110" />
           <div className="elector-details">
          <h3>{electorDetails.name}</h3>
         <p>DOB: {electorDetails.dob}</p>
         <p>Seat: {electorDetails.seat}</p>
          <p className="status1">Status: {hasVote ? "You have already voted!" : "You can vote now."}</p>
          </div>
        </div>
      ) : (
        electorId && <p className="error1">Somthing Wrong!... Check.</p>
      )}

      {/* Voting Options */}
      {electorDetails && !hasVote && (
        <div className="party-list">
          <h3>Select a Party to Vote For:</h3>
          {parties.map((party) => (
            <div key={party.id} className="party-cards">
              <img src={party.imageUrl} alt={party.name} width="70" height="70" />
              <div className="card-mid">
              <h4>{party.name}</h4>
            
              <p>Party: {party.partyName}</p></div>
              <button onClick={() => handleVote(party.id)} disabled={hasVote}>
                Vote
              </button>
              </div>
            
          ))}
        </div>
      )}
 
      {/* Success Popup */}
      {showPopup && (
        <div className="popups">
          <div className="popup-content">
            <h3>Vote Successful!</h3>
            <p>Thank you for casting your vote. The page will reset now.</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default VotePage;  



