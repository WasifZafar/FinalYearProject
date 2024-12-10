// import React, { useEffect, useState } from "react";
// import { db } from "../firebaseConfig";
// import { collection, query, where, onSnapshot } from "firebase/firestore";

// const VoteCount = () => {
//   const [parties, setParties] = useState([]);
//   const [electionKey, setElectionKey] = useState("");

//   useEffect(() => {
//     if (!electionKey) {
//       setParties([]);
//       return;
//     }

//     const fetchParties = () => {
//       const partyQuery = query(collection(db, "parties"), where("key", "==", electionKey));
//       const unsubscribe = onSnapshot(partyQuery, (snapshot) => {
//         setParties(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
//       });

//       return unsubscribe;
//     };

//     const unsubscribe = fetchParties();
//     return () => unsubscribe();
//   }, [electionKey]);

//    const styles = {
//    container: {
//     margin: "50px auto",
//     textAlign: "center",
//     maxWidth: "600px",
//     backgroundColor: "#ffffff",
//     padding: "40px 30px",
//     borderRadius: "15px",
//     boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
//     color: "#333",
//     marginTop: "100px",
//   },
//   title: {
//     fontSize: "28px",
//     fontWeight: "bold",
//     color: "#004A89",  // A nice blue color for headings
//     marginBottom: "30px",
//     letterSpacing: "0.5px",
//   },
//   inputContainer: {
//     marginBottom: "25px",
//   },
//   input: {
//     width: "100%",
//     padding: "12px 15px",
//     fontSize: "16px",
//     border: "2px solid #ccc",
//     borderRadius: "8px",
//     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
//     marginTop: "10px",
//     transition: "border-color 0.3s ease",
//   },
//   inputFocus: {
//     borderColor: "#0078d4",  // Highlight border on focus
//      outline: "none",
//   },
//   partyCard: {
//     backgroundColor: "#ffffff",
//     margin: "20px auto",
//     padding: "20px",
//     borderRadius: "15px",
//     boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
//     maxWidth: "320px",
//     transition: "transform 0.3s ease, box-shadow 0.3s ease",
//     textAlign: "center",
//     color: "#333",
//   },
//   partyCardHover: {
//     transform: "translateY(-8px)",
//     boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
//   },
//   image: {
//     display: "block",
//     margin: "0 auto 15px",
//     borderRadius: "50%",
//     border: "4px solid #0056b3",
//     width: "100px",
//     height: "100px",
//     objectFit: "cover",
//   },
//   partyText: {
//     fontSize: "16px",
//     color: "#666",
//     marginBottom: "10px",
//   },
//   partyName: {
//     fontSize: "20px",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: "10px",
//   },
//   '@media (min-width: 768px)': {
//     container: {
//       width: "70%",
//     },
//     partyCard: {
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "flex-start",
//       gap: "20px",
//       textAlign: "left",
//       maxWidth: "600px",
//     },
//     image: {
//       width: "150px",
//       height: "150px",
//     },
//     partyText: {
//       fontSize: "18px",
//     },
//   },
//   '@media (max-width: 480px)': {
//     input: {
//       fontSize: "14px",
//     },
//     image: {
//       width: "90px",
//       height: "90px",
//     },
//     partyText: {
//       fontSize: "14px",
//     },
//   },
//   button: {
//     backgroundColor: "#0056b3",
//     color: "#fff",
//     padding: "12px 20px",
//     fontSize: "16px",
//     border: "none",
//     borderRadius: "5px",
//     cursor: "pointer",
//     transition: "background-color 0.3s ease",
//   },
//   buttonHover: {
//     backgroundColor: "#003f74",
//   },
//   errorText: {
//     color: "#d9534f",
//     fontSize: "16px",
//     marginTop: "20px",
//   },
//   successText: {
//     color: "#28a745",
//     fontSize: "16px",
//     marginTop: "20px",
//   },

//    };

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>Political Party Vote Counts</h2>
//       <div style={styles.inputContainer}>
//         <label htmlFor="electionKey">Enter Election Key:</label>
//         <input
//           type="text"
//           id="electionKey"
//           value={electionKey}
//           onChange={(e) => setElectionKey(e.target.value)}
//           placeholder="Enter Election Key to see vote counts"
//           required
//           style={styles.input}
//         />
//       </div>
//       {parties.length > 0 ? (
//         parties.map((party) => (
    
//           <div
//             key={party.id}
//             style={styles.partyCard}
//             onMouseEnter={(e) => (e.currentTarget.style.transform = styles.partyCardHover.transform)}
//             onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
//           >
//             <img src={party.imageUrl} alt={party.name} style={styles.image} />
//             <h3>{party.name}</h3>
//             <p style={styles.partyText}>Party: {party.partyName}</p>
//             <p style={styles.partyText}>Votes: {party.votes || 0}</p>
//           </div>
         
//         ))
//       ) : (
//         <p>{electionKey ? "No parties found for this election key." : "Enter an election key to see vote counts."}</p>
//       )}
//     </div>
//   );
// };

// export default VoteCount;



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
