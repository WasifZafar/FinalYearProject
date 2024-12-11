import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import './count.css'; // Import the CSS file

const VoteCount = () => {
  // State hooks for managing party data, election key, and loading state
  const [parties, setParties] = useState([]);
  const [electionKey, setElectionKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors

  // useEffect to fetch party data from Firestore
  useEffect(() => {
    if (!electionKey) {
      setParties([]);
      setLoading(false);
      return;
    }

    const fetchParties = () => {
      const partyQuery = query(collection(db, "parties"), where("key", "==", electionKey));
      
      // Set up the Firestore listener to listen for updates to party data
      const unsubscribe = onSnapshot(
        partyQuery,
        (snapshot) => {
          const fetchedParties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setParties(fetchedParties);
          setLoading(false); // Set loading state to false once data is fetched
        },
        (error) => {
          setLoading(false);
          setError("Failed to fetch parties. Please try again.");
        }
      );

      return unsubscribe; // Clean up Firestore listener on unmount or when electionKey changes
    };

    // Only fetch data if electionKey is provided
    const unsubscribe = fetchParties();
    return () => unsubscribe(); // Clean up listener when component unmounts or electionKey changes
  }, [electionKey]);

  // Calculate the total number of votes
  const totalVotes = parties.reduce((total, party) => total + (party.votes || 0), 0);

  // Sort the parties by the number of votes in descending order
  const sortedParties = [...parties].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  // Determine the card color based on votes
  const getCardColor = (votes) => {
    const maxVotes = Math.max(...sortedParties.map((party) => party.votes || 0)); // Highest votes
    if (votes === maxVotes && votes > 0) {
      return 'green-card'; // Party with the highest votes gets a green card
    }
    if (votes === 0) {
      return 'white-card'; // Party with 0 votes gets a white card
    }
    return 'red-card'; // Other parties with non-zero votes get a red card
  };

  return (
    <div className="vote-container">
      <h2 className="vote-title">Political Party Vote Counts</h2>
      
      {/* Input for election key */}
      <div className="vote-input-container">
        <label htmlFor="electionKey">Enter Election Key:</label>
        <input
          type="password"
          id="electionKey"
          value={electionKey}
          onChange={(e) => setElectionKey(e.target.value)}
          placeholder="Enter Election Key to see vote counts"
          required
          className="vote-input"
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p> // Display error message if data fetch fails
      ) : sortedParties.length > 0 ? (
        <>
          {/* Render sorted party cards */}
          {sortedParties.map((party) => (
            <div
              key={party.id}
              className={`vote-party-cardo ${getCardColor(party.votes)}`} // Apply dynamic card color based on votes
            >
              <img src={party.imageUrl} alt={party.name} className="vote-imag" />
              <h3 className="vote-party-name">{party.name}</h3>
              <p className="vote-party-texta">Party: {party.partyName}</p>
              <p className="vote-party-text">Votes: {party.votes || 0}</p>
            </div>
          ))}
          {/* Display the total number of votes */}
          <div className="vote-total fade-in">Total Votes: {totalVotes}</div>
        </>
      ) : (
        <p className="request">{electionKey ? "No parties found for this election key." : "Enter an election key to see vote counts."}</p>
      )}
    </div>
  );
};

export default VoteCount;
