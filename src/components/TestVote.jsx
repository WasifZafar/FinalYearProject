import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./testVotePage.css";

const TestVotePage = () => {
  const [electionKey, setElectionKey] = useState(localStorage.getItem("electionKey") || ""); // Load from localStorage if available
  const [parties, setParties] = useState(JSON.parse(localStorage.getItem("parties")) || []); // Retrieve saved parties
  const [testVotes, setTestVotes] = useState(JSON.parse(localStorage.getItem("testVotes")) || {}); // Retrieve saved votes
  const [showResetPopup, setShowResetPopup] = useState(false); // Controls reset popup visibility
  const [hasVoted, setHasVoted] = useState(localStorage.getItem("hasVoted") === "true" || false); // Track if a vote has been made
  const [resetConfirmed, setResetConfirmed] = useState(false); // State for reset confirmation
  const [tempElectionKey, setTempElectionKey] = useState(""); // Temporary election key for validation
  const [showVoteSuccessPopup, setShowVoteSuccessPopup] = useState(false); // Controls success popup visibility

  // Effect to fetch parties when election key changes
  useEffect(() => {
    if (!electionKey) return;

    const fetchParties = async () => {
      // Query to fetch parties for the specific election key
      const partyQuery = query(collection(db, "parties"), where("key", "==", electionKey));
      try {
        const partyCollection = await getDocs(partyQuery);
        const fetchedParties = partyCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setParties(fetchedParties);
        localStorage.setItem("parties", JSON.stringify(fetchedParties)); // Save parties to localStorage
      } catch (error) {
        console.error("Error fetching parties:", error);
      }
    };

    fetchParties();
  }, [electionKey]);

  // Save electionKey to localStorage whenever it changes
  useEffect(() => {
    if (electionKey) {
      localStorage.setItem("electionKey", electionKey);
    }
  }, [electionKey]);

  // Save votes to localStorage whenever testVotes change
  useEffect(() => {
    if (Object.keys(testVotes).length > 0) {
      localStorage.setItem("testVotes", JSON.stringify(testVotes));
    }
  }, [testVotes]);

  // Save voting status to localStorage
  useEffect(() => {
    localStorage.setItem("hasVoted", hasVoted);
  }, [hasVoted]);

  // Handle voting logic
  const handleVote = (partyId) => {
    // Update the test vote count for the party
    const currentVotes = { ...testVotes };
    currentVotes[partyId] = (currentVotes[partyId] || 0) + 1;
    setTestVotes(currentVotes);

    // Show success popup and mark voting as done
    setShowVoteSuccessPopup(true);
    setHasVoted(true);
  };

  // Show reset confirmation popup
  const handleReset = () => {
    setShowResetPopup(true);
    setResetConfirmed(false); // Reset confirmation flag
  };

  // Handle reset confirmation (verify election key and reset data)
  const handleConfirmReset = () => {
    if (tempElectionKey === electionKey) {
      // Reset all state variables related to voting
      setParties([]);
      setTestVotes({});
      setHasVoted(false);
      setShowResetPopup(false); // Close reset popup
      localStorage.removeItem("parties");
      localStorage.removeItem("testVotes");
      localStorage.removeItem("hasVoted"); // Clear related data from localStorage
      console.log("Data reset successfully");
    } else {
      alert("Incorrect election key! Please try again.");
    }
  };

  // Close reset popup without resetting
  const handleCloseResetPopup = () => {
    setShowResetPopup(false); // Close reset popup
    setResetConfirmed(false); // Reset the confirmation flag
  };

  // Close vote success popup
  const handleCloseVoteSuccessPopup = () => {
    setShowVoteSuccessPopup(false); // Hide success popup
  };

  return (
    <div className="test-vote-container">
      <h2>Test Vote Dashboard</h2>

      {/* Election Key Input (Visible if no vote has been made or parties fetched) */}
      {!hasVoted && !parties.length && (
        <div className="election-key-input">
          <label htmlFor="electionKey">Enter Election Key:</label>
          <input
            type="password"
            id="electionKey"
            value={electionKey}
            onChange={(e) => setElectionKey(e.target.value)}
            required
            placeholder="Enter election key"
          />
        </div>
      )}

      {/* Display Parties (after election key is entered and parties are fetched) */}
      {electionKey && parties.length > 0 && (
        <div className="parties-container">
          <h3>Select a Party to Test Vote:</h3>
          {parties.map((party) => (
            <div key={party.id} className="party-card">
              <img src={party.imageUrl} alt={party.name} width="100" height="100" />
              <div className="detail-con">
                <h4>{party.name}</h4>
                <p>Party: {party.partyName}</p>
              </div>
              <button onClick={() => handleVote(party.id)}>Test Vote</button>
            </div>
          ))}
        </div>
      )}

      {/* Display Test Vote Results */}
      {parties.length > 0 && (
        <div className="vote-results">
          <h3 className="results-title">Test Vote Results</h3>
          <div className="test-cont">
            {parties.map((party) => (
              <div key={party.id} className="party-item">
                <p className="party-name">{party.name}</p>
                <p className="vote-count2">{testVotes[party.id] || 0} -votes</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vote Success Popup */}
      {showVoteSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-contents">
            <h4 className="succ">Vote Successful!</h4>
            <button onClick={handleCloseVoteSuccessPopup} className="ok-button">
              OK
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Popup */}
      {showResetPopup && !resetConfirmed && (
        <div className="popup-overlay">
          <div className="popup-contents">
            <h3>Are you sure you want to reset? This action cannot be undone.</h3>
            <button onClick={handleCloseResetPopup} className="cancel-button">
              Cancel
            </button>
            <button onClick={() => setResetConfirmed(true)} className="yes-button">
              Yes, Reset
            </button>
          </div>
        </div>
      )}

      {/* Election Key Input inside Popup for Reset Confirmation */}
      {resetConfirmed && (
        <div className="popup-overlay">
          <div className="popup-contents">
            <h3>Please Enter Election Key to Confirm Reset:</h3>
            <input
              type="password"
              value={tempElectionKey}
              onChange={(e) => setTempElectionKey(e.target.value)}
              placeholder="Enter Election Key"
              required
            />
            <button onClick={handleConfirmReset} className="ok-buttons">
              Confirm Reset
            </button>
            <button onClick={handleCloseResetPopup} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* No Parties Found Message */}
      {electionKey && parties.length === 0 && (
        <p>No parties found for the given election key. Please try again.</p>
      )}

      {/* Reset Button */}
      <div className="reset-container">
        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
      </div>
    </div>
  );
};

export default TestVotePage;
