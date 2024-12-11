// import React, { useState, useEffect } from "react";
// import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
// import { db } from "../firebaseConfig"; // Firebase configuration for Firestore
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   CircularProgress
// } from "@mui/material"; // Material UI components

// const AdminPanel = () => {
//   const [states, setStates] = useState([]); // List of states
//   const [seats, setSeats] = useState({}); // Seats per state
//   const [selectedState, setSelectedState] = useState(""); // Selected state
//   const [selectedSeat, setSelectedSeat] = useState(""); // Selected seat
//   const [dataType, setDataType] = useState("electors"); // Selected data type (electors/parties)
//   const [oldKey, setOldKey] = useState(""); // Old key input for updating data
//   const [newKey, setNewKey] = useState(""); // New key input for updating data
//   const [newHasVote, setNewHasVote] = useState(false); // Has vote flag (for electors)
//   const [users, setUsers] = useState([]); // List of users to display
//   const [loading, setLoading] = useState(false); // Loading state
//   const [error, setError] = useState(""); // Error message for key mismatch

//   // Fetch states and seats from Firestore based on selected dataType (electors/parties)
//   useEffect(() => {
//     const fetchStatesAndSeats = async () => {
//       try {
//         const collectionName = dataType;
//         const statesQuery = query(collection(db, collectionName)); // Query Firestore collection
//         const snapshot = await getDocs(statesQuery); // Fetch documents

//         const stateSet = new Set(); // Set to hold unique states
//         const seatMap = {}; // Map of seats per state

//         snapshot.forEach((doc) => {
//           const data = doc.data();
//           stateSet.add(data.state); // Add state to the set
//           if (data.state) {
//             if (!seatMap[data.state]) {
//               seatMap[data.state] = new Set(); // Create a new set if not exists
//             }
//             seatMap[data.state].add(data.seat); // Add seat to the map
//           }
//         });

//         // Convert sets to arrays for easier processing
//         const stateArray = Array.from(stateSet);
//         const seatObj = {};
//         Object.keys(seatMap).forEach((state) => {
//           seatObj[state] = Array.from(seatMap[state]); // Convert seat sets to arrays
//         });

//         setStates(stateArray); // Set states list
//         setSeats(seatObj); // Set seats list
//       } catch (error) {
//         console.error("Error fetching states and seats:", error); // Log error
//         setError("Error fetching states and seats. Please try again.");
//       }
//     };

//     fetchStatesAndSeats(); // Trigger state and seat fetch when dataType changes
//   }, [dataType]);

//   // Fetch users based on selected state, seat, and data type
//   const fetchUsers = async () => {
//     if (!selectedState) {
//       setError("Please select a state.");
//       return; // Return early if no state is selected
//     }
//     setLoading(true); // Set loading to true

//     try {
//       const collectionName = dataType;
//       let queryRef;

//       // Construct the query based on state and seat
//       if (selectedSeat === "All" || !selectedSeat) {
//         queryRef = query(collection(db, collectionName), where("state", "==", selectedState));
//       } else {
//         queryRef = query(
//           collection(db, collectionName),
//           where("state", "==", selectedState),
//           where("seat", "==", selectedSeat)
//         );
//       }

//       const querySnapshot = await getDocs(queryRef); // Fetch documents from Firestore

//       if (querySnapshot.empty) {
//         setError("No users found for the selected state and seat.");
//         setUsers([]);
//         return; // No users found, exit early
//       }

//       const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setUsers(userList); // Set fetched users
//     } catch (error) {
//       console.error("Error fetching users:", error); // Log error
//       setError("Error fetching users. Please try again.");
//     } finally {
//       setLoading(false); // Set loading to false after fetching
//     }
//   };

//   // Update data in Firestore (including hasVote for electors)
//   const updateData = async () => {
//     if (!oldKey || !newKey) {
//       setError("Both old key and new key are required.");
//       return;
//     }

//     if (oldKey === newKey) {
//       setError("Old key and new key cannot be the same.");
//       return;
//     }

//     setLoading(true); // Set loading to true
//     setError(""); // Reset error message

//     try {
//       const collectionName = dataType;
//       let queryRef;

//       // Construct the query based on state and seat
//       if (selectedSeat === "All" || !selectedSeat) {
//         queryRef = query(collection(db, collectionName), where("state", "==", selectedState));
//       } else {
//         queryRef = query(
//           collection(db, collectionName),
//           where("state", "==", selectedState),
//           where("seat", "==", selectedSeat)
//         );
//       }

//       const snapshot = await getDocs(queryRef); // Fetch documents for updating

//       let isOldKeyValid = false;
//       for (const docSnapshot of snapshot.docs) {
//         const docData = docSnapshot.data();
//         if (docData.key === oldKey) {
//           isOldKeyValid = true; // If the old key matches, proceed with updating
//           const ref = doc(db, collectionName, docSnapshot.id); // Reference to document
//           await updateDoc(ref, { key: newKey }); // Update the document with new key

//           // For electors, set hasVote to false
//           if (dataType === "electors") {
//             await updateDoc(ref, { hasVote: false }); // Set hasVote to false
//           }
//         }
//       }

//       if (!isOldKeyValid) {
//         setError("Old key does not match. Please check and try again.");
//       } else {
//         alert("Data updated successfully!");
//         setOldKey(""); // Clear the old key
//         setNewKey(""); // Clear the new key
//         fetchUsers(); // Refresh the user list
//       }
//     } catch (error) {
//       console.error("Error updating data:", error); // Log error
//       setError("Error updating data. Please try again.");
//     } finally {
//       setLoading(false); // Set loading to false after update
//     }
//   };

//   // Mask the key with asterisks
//   const maskKey = (key) => {
//     if (!key) return "";
//     return "*".repeat(key.length); // Return a string of asterisks equal to the key length
//   };

//   // Reset the form selections and clear the users list
//   const handleClose = () => {
//     setSelectedState("");
//     setSelectedSeat("");
//     setUsers([]);
//     setOldKey("");
//     setNewKey("");
//     setNewHasVote(false);
//     setError(""); // Clear any error messages
//   };

//   return (
//     <Box
//       sx={{
//         padding: 4,
//         maxWidth: "900px",
//         margin: "40px auto",
//         backgroundColor: "#f9f9f9",
//         borderRadius: "8px",
//         boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
//         marginTop: "100px",
//       }}
//     >
//       <Typography
//         variant="h4"
//         sx={{
//           marginBottom: 2,
//           textAlign: "center",
//           fontWeight: "bold",
//           color: "#333",
//         }}
//       >
//         Admin Panel
//       </Typography>

//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: { xs: "column", sm: "row" },
//           gap: 2,
//           marginBottom: 3,
//           justifyContent: "space-between",
//         }}
//       >
//         <FormControl sx={{ minWidth: 200 }}>
//           <InputLabel>Data Type</InputLabel>
//           <Select value={dataType} onChange={(e) => setDataType(e.target.value)}>
//             <MenuItem value="electors">Electors</MenuItem>
//             <MenuItem value="parties">Parties</MenuItem>
//           </Select>
//         </FormControl>

//         <FormControl sx={{ minWidth: 200 }}>
//           <InputLabel>State</InputLabel>
//           <Select
//             value={selectedState}
//             onChange={(e) => {
//               setSelectedState(e.target.value);
//               setSelectedSeat(""); // Reset seat when state changes
//             }}
//           >
//             {states.map((state) => (
//               <MenuItem key={state} value={state}>
//                 {state}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl sx={{ minWidth: 200 }} disabled={!selectedState}>
//           <InputLabel>Seat</InputLabel>
//           <Select value={selectedSeat} onChange={(e) => setSelectedSeat(e.target.value)}>
//             <MenuItem value="All">All Seats</MenuItem>
//             {selectedState &&
//               seats[selectedState]?.map((seat) => (
//                 <MenuItem key={seat} value={seat}>
//                   {seat}
//                 </MenuItem>
//               ))}
//           </Select>
//         </FormControl>
//       </Box>

//       {dataType === "electors" && (
//         <TextField
//           label="Has Vote"
//           value="No"
//           variant="outlined"
//           fullWidth
//           disabled
//           sx={{
//             marginTop: 2,
//             backgroundColor: "#fff",
//             borderRadius: "4px",
//           }}
//         />
//       )}

//       <TextField
//         label="Old Key"
//         type="password"
//         variant="outlined"
//         fullWidth
//         value={oldKey}
//         onChange={(e) => setOldKey(e.target.value)}
//         sx={{
//           marginTop: 2,
//           backgroundColor: "#fff",
//           borderRadius: "4px",
//         }}
//       />

//       <TextField
//         label="New Key"
//         type="password"
//         variant="outlined"
//         fullWidth
//         value={newKey}
//         onChange={(e) => setNewKey(e.target.value)}
//         inputProps={{
//           minLength: 6,
//           maxLength: 10,
//         }}
//         error={newKey.length > 0 && (newKey.length < 6 || newKey.length > 10)} // Error validation
//         helperText={newKey.length > 0 && (newKey.length < 6 || newKey.length > 10) ? "Key must be between 6 and 10 characters" : ""}
//         sx={{
//           marginTop: 2,
//           backgroundColor: "#fff",
//           borderRadius: "4px",
//         }}
//       />

//       {error && <Typography color="error">{error}</Typography>} {/* Display error message */}

//       <Box
//         sx={{
//           marginTop: 3,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Button
//           variant="contained"
//           onClick={fetchUsers}
//           sx={{
//             backgroundColor: "#1976d2",
//             "&:hover": { backgroundColor: "#1565c0" },
//           }}
//         >
//           Fetch Users
//         </Button>
//         {loading && <CircularProgress sx={{ marginLeft: 2 }} />}
//       </Box>

//       <Box sx={{ display: "flex", gap: 3, margin: 4, justifyContent: "center" }}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={updateData}
//           sx={{
//             backgroundColor: "#1976d2",
//             "&:hover": { backgroundColor: "#1565c0" },
//           }}
//         >
//           Update Data
//         </Button>
//         <Button
//           variant="outlined"
//           onClick={handleClose}
//           sx={{
//             borderColor: "#1976d2",
//             color: "#1976d2",
//             "&:hover": { borderColor: "#1565c0", color: "#1565c0" },
//           }}
//         >
//           Close
//         </Button>
//       </Box>

//       <TableContainer
//         component={Paper}
//         sx={{
//           marginTop: 3,
//           boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//           borderRadius: "10px",
//         }}
//       >
//         <Table>
//           <TableHead>
//             <TableRow sx={{ backgroundColor: "#1976d2" }}>
//               <TableCell sx={{ color: "#fff" }}>ID</TableCell>
//               <TableCell sx={{ color: "#fff" }}>Name</TableCell>
//               <TableCell sx={{ color: "#fff" }}>Has Vote</TableCell>
//               <TableCell sx={{ color: "#fff" }}>Key</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {users.map((user) => (
//               <TableRow key={user.id}>
//                 <TableCell>{user.id}</TableCell>
//                 <TableCell>{user.name}</TableCell>
//                 <TableCell>{user.hasVote ? "Yes" : "No"}</TableCell>
//                 <TableCell>{maskKey(user.key)}</TableCell> {/* Display masked key */}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default AdminPanel;



import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Firebase configuration for Firestore
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
} from "@mui/material"; // Material UI components

const AdminPanel = () => {
  const [states, setStates] = useState([]); // List of states
  const [seats, setSeats] = useState({}); // Seats per state
  const [selectedState, setSelectedState] = useState(""); // Selected state
  const [selectedSeat, setSelectedSeat] = useState(""); // Selected seat
  const [dataType, setDataType] = useState("electors"); // Selected data type (electors/parties)
  const [oldKey, setOldKey] = useState(""); // Old key input for updating data
  const [newKey, setNewKey] = useState(""); // New key input for updating data
  const [newHasVote, setNewHasVote] = useState(false); // Has vote flag (for electors)
  const [users, setUsers] = useState([]); // List of users to display
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message for key mismatch
  const [showOldKeyInput, setShowOldKeyInput] = useState(false); // Show Old Key input when needed
  const [snackMessage, setSnackMessage] = useState(""); // Snackbar message for success/error
  const [snackOpen, setSnackOpen] = useState(false); // Snackbar visibility

  // Real-time listener for fetching states and seats
  useEffect(() => {
    const fetchStatesAndSeats = () => {
      const collectionName = dataType;
      const statesQuery = query(collection(db, collectionName)); // Query Firestore collection
      const unsubscribe = onSnapshot(statesQuery, (snapshot) => {
        const stateSet = new Set(); // Set to hold unique states
        const seatMap = {}; // Map of seats per state

        snapshot.forEach((doc) => {
          const data = doc.data();
          stateSet.add(data.state); // Add state to the set
          if (data.state) {
            if (!seatMap[data.state]) {
              seatMap[data.state] = new Set(); // Create a new set if not exists
            }
            seatMap[data.state].add(data.seat); // Add seat to the map
          }
        });

        // Convert sets to arrays for easier processing
        const stateArray = Array.from(stateSet);
        const seatObj = {};
        Object.keys(seatMap).forEach((state) => {
          seatObj[state] = Array.from(seatMap[state]); // Convert seat sets to arrays
        });

        setStates(stateArray); // Set states list
        setSeats(seatObj); // Set seats list
      });

      return unsubscribe;
    };

    const unsubscribe = fetchStatesAndSeats();
    return () => unsubscribe(); // Cleanup on unmount
  }, [dataType]);

  // Fetch users based on selected state, seat, and data type
  const fetchUsers = async () => {
    if (!selectedState) return; // Return early if no state is selected
    setLoading(true); // Set loading to true

    try {
      const collectionName = dataType;
      let queryRef;

      if (selectedSeat === "All" || !selectedSeat) {
        queryRef = query(collection(db, collectionName), where("state", "==", selectedState));
      } else {
        queryRef = query(
          collection(db, collectionName),
          where("state", "==", selectedState),
          where("seat", "==", selectedSeat)
        );
      }

      const snapshot = await getDocs(queryRef); // Fetch documents from Firestore
      const userList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setUsers(userList); // Set fetched users
    } catch (error) {
      console.error("Error fetching users:", error); // Handle errors
      alert("Error fetching users. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  // Update data in Firestore (including hasVote for electors)
  const updateData = async () => {
    // Input validation
    if (newKey === "") {
      setError("New key is required.");
      return;
    }

    // If the key is not present or is null, we don't need the oldKey
    if (!showOldKeyInput && !newKey) {
      setError("New key is required.");
      return;
    }

    setLoading(true); // Set loading to true
    setError(""); // Reset error message

    try {
      const collectionName = dataType;
      let queryRef;

      // Construct query for Firestore based on selected state and seat
      if (selectedSeat === "All" || !selectedSeat) {
        queryRef = query(collection(db, collectionName), where("state", "==", selectedState));
      } else {
        queryRef = query(
          collection(db, collectionName),
          where("state", "==", selectedState),
          where("seat", "==", selectedSeat)
        );
      }

      const snapshot = await getDocs(queryRef); // Get snapshot from Firestore

      let isOldKeyValid = false;
      for (const docSnapshot of snapshot.docs) {
        const docData = docSnapshot.data();

        // If the key is null or missing, we don't need the oldKey, just set the newKey
        if (docData.key === null || docData.key === undefined) {
          const ref = doc(db, collectionName, docSnapshot.id);
          await updateDoc(ref, { key: newKey }); // Update with new key
          setSnackMessage("Data updated successfully!");
          setSnackOpen(true); // Show success snackbar
        }
        // If the oldKey matches the current key, proceed with the update
        else if (docData.key === oldKey) {
          isOldKeyValid = true;
          const ref = doc(db, collectionName, docSnapshot.id);
          await updateDoc(ref, { key: newKey }); // Update with new key

          // If electors, set hasVote to false
          if (dataType === "electors") {
            await updateDoc(ref, { hasVote: false });
          }

          setSnackMessage("Data updated successfully!");
          setSnackOpen(true); // Show success snackbar
        }
      }

      // If no matching key found (when oldKey is not found)
      if (!isOldKeyValid && docData.key !== null) {
        setError("Old key does not match. Please check and try again.");
      }

      // Auto-update the user list after update
      fetchUsers(); // Fetch users to reflect the update without page refresh

    } catch (error) {
      console.error("Error updating data:", error);
      setError("Error updating data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset the form selections and clear the users list
  const handleClose = () => {
    setSelectedState("");
    setSelectedSeat("");
    setUsers([]);
    setOldKey("");
    setNewKey("");
    setNewHasVote(false);
    setError(""); // Clear any error messages
    setShowOldKeyInput(false); // Hide the old key input again
  };

  // This effect will check the users' data and determine whether to show the old key field
  useEffect(() => {
    if (users.length > 0) {
      const firstUser = users[0];
      // If the key is null or undefined for the user, we don't need the oldKey, just set the newKey
      setShowOldKeyInput(firstUser.key !== null && firstUser.key !== undefined);
    }
  }, [users]);

  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: "900px",
        margin: "40px auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "100px",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          marginBottom: 2,
          textAlign: "center",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        Admin Panel
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          marginBottom: 3,
          justifyContent: "space-between",
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Data Type</InputLabel>
          <Select value={dataType} onChange={(e) => setDataType(e.target.value)}>
            <MenuItem value="electors">Electors</MenuItem>
            <MenuItem value="parties">Parties</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>State</InputLabel>
          <Select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedSeat(""); // Reset seat when state changes
            }}
          >
            {states.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} disabled={!selectedState}>
          <InputLabel>Seat</InputLabel>
          <Select value={selectedSeat} onChange={(e) => setSelectedSeat(e.target.value)}>
            <MenuItem value="All">All Seats</MenuItem>
            {selectedState &&
              seats[selectedState]?.map((seat) => (
                <MenuItem key={seat} value={seat}>
                  {seat}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {dataType === "electors" && (
        <TextField
          label="Has Vote"
          value="No"
          variant="outlined"
          fullWidth
          disabled
          sx={{
            marginTop: 2,
            backgroundColor: "#fff",
            borderRadius: "4px",
          }}
        />
      )}

      {showOldKeyInput && (
        <TextField
          label="Old Key"
          type="password"
          variant="outlined"
          fullWidth
          value={oldKey}
          onChange={(e) => setOldKey(e.target.value)}
          sx={{
            marginTop: 2,
            backgroundColor: "#fff",
            borderRadius: "4px",
          }}
        />
      )}

      <TextField
        label="New Key"
        type="password"
        variant="outlined"
        fullWidth
        value={newKey}
        onChange={(e) => setNewKey(e.target.value)}
        inputProps={{
          minLength: 6,
          maxLength: 10,
        }}
        error={newKey.length > 0 && (newKey.length < 6 || newKey.length > 10)} // Error validation
        helperText={newKey.length > 0 && (newKey.length < 6 || newKey.length > 10) ? "Key must be between 6 and 10 characters" : ""}
        sx={{
          marginTop: 2,
          backgroundColor: "#fff",
          borderRadius: "4px",
        }}
      />

      {error && <Typography color="error">{error}</Typography>} {/* Display error message */}

      <Box
        sx={{
          marginTop: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={fetchUsers}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Fetch Users
        </Button>
        {loading && <CircularProgress sx={{ marginLeft: 2 }} />}
      </Box>

      <Box sx={{ display: "flex", gap: 3, margin: 4, justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={updateData}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Update Data
        </Button>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": { borderColor: "#1565c0", color: "#1565c0" },
          }}
        >
          Close
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: 3,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff" }}>ID</TableCell>
              <TableCell sx={{ color: "#fff" }}>Name</TableCell>
              <TableCell sx={{ color: "#fff" }}>Has Vote</TableCell>
              <TableCell sx={{ color: "#fff" }}>Key</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.hasVote ? "Yes" : "No"}</TableCell>
                <TableCell>{user.key ? "******" : "Not Set"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
        action={
          <Button color="secondary" size="small" onClick={() => setSnackOpen(false)}>
            Close
          </Button>
        }
      />
    </Box>
  );
};

export default AdminPanel;



