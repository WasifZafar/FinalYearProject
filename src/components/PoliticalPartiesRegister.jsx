import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; // Ensure firebaseConfig is correctly set up
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getDatabase, ref, onValue } from "firebase/database";
import "./form.css";

const PoliticalPartiesRegister = () => {
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarExists, setAadhaarExists] = useState(false);
  const [aadhaarValidated, setAadhaarValidated] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [statesData, setStatesData] = useState({});
  const [seats, setSeats] = useState([]);
  const [state, setState] = useState("");
  const [seat, setSeat] = useState("");
  const [formData, setFormData] = useState({
    surnamePrefix: "Mr.",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    address: "",
    pinCode: "",
    imageUrl: "",
    email: "",
    partyName: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const database = getDatabase();
    const statesRef = ref(database, "Lok Sabha");

    onValue(statesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatesData(data);
      }
    });
  }, []);

  useEffect(() => {
    if (state && statesData[state]?.seats) {
      setSeats(statesData[state].seats);
    } else {
      setSeats([]);
    }
  }, [state, statesData]);

  const handleAadhaarCheck = async () => {
    if (!aadhaar || aadhaar.length !== 4) {
      alert("Enter the last four digits of your Aadhaar.");
      return;
    }

    try {
      const electorsRef = collection(db, "parties");
      const q = query(electorsRef, where("aadhaar", "==", aadhaar));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setAadhaarExists(true);
        setAadhaarValidated(false);
      } else {
        setAadhaarExists(false);
        setAadhaarValidated(true);
      }
    } catch (error) {
      console.error("Error checking Aadhaar:", error);
    }
  };

  const checkEmailExists = async (email) => {
    const electorsRef = collection(db, "parties");
    const q = query(electorsRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { dob, email, surnamePrefix, firstName, lastName, pinCode, partyName} = formData;

      if (!partyName.trim()) {
        throw new Error("Party name is required.");
      }
  
      if (!/^\d{6}$/.test(pinCode)) {
        throw new Error("Pin code must be exactly 6 digits.");
      } 

      const age = new Date().getFullYear() - new Date(dob).getFullYear();
      if (age < 18) throw new Error("You must be at least 18 years old to register.");

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setEmailError("This email is already registered.");
        return;
      }

      // Combine first name, surname prefix, and last name into a single "name" field
      const combinedName = `${surnamePrefix} ${firstName} ${lastName}`;

      await addDoc(collection(db, "parties"), {
        aadhaar,
        name: combinedName,
        partyName,
        dob,
        gender: formData.gender,
        address: formData.address,
        pinCode: formData.pinCode,
        imageUrl: formData.imageUrl,
        email,
        state,
        seat,
      });

      setShowSuccessPopup(true);
      setEmailError("");
      clearForm();
    } catch (error) {
      alert(error.message);
    }
  };

  const clearForm = () => {
    setFormData({
      surnamePrefix: "Mr.",
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      address: "",
      pinCode: "",
      imageUrl: "",
      email: "",
      partyName: "",
    });
    setAadhaar("");
    setState("");
    setSeat("");
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    navigate('/');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAadhaarCheck();
    }
  };

  return (
    <div className="container1">
    {!aadhaarValidated ? (
      <div className="aadhaar-container">
        <h2 className="heading">Political Parties Registration Page..</h2>
        <h3 >Check Aadhaar</h3>
        <input
          type="text"
          placeholder="Last 4 digits of Aadhaar"
          value={aadhaar}
          onChange={(e) => {
            if (/^\d{0,4}$/.test(e.target.value)) {
              setAadhaar(e.target.value);
            }
          }}
          onKeyPress={handleKeyPress}
          maxLength="4"
          className="input"
        />
        <button onClick={handleAadhaarCheck} className="button">
          Check Aadhaar
        </button>
        {aadhaarExists && <p className="error-text">Aadhaar is already registered!</p>}
      </div>
    ) : (
      <form onSubmit={handleRegister} className="form">
        <h2 className="heading">Political Parties Registration Page..</h2>
        
        <select
          value={formData.surnamePrefix}
          onChange={(e) => setFormData({ ...formData, surnamePrefix: e.target.value })}
          className="select"
          required
        >
          <option value="Mr.">Mr.</option>
          <option value="Miss">Miss</option>
          <option value="Mrs.">Mrs.</option>
        </select>
  
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value.toUpperCase() })}
          required
          className="input"
        />
  
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value.toUpperCase() })}
          // required
          className="input"
        />
  
        <input
          type="date"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          required
          className="input"
        />
  
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="select"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
  
        <textarea
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          className="textarea"
        />
  
        <input
          type="text"
          placeholder="Pin Code (6 digits)"
          value={formData.pinCode}
          onChange={(e) =>
            setFormData({ ...formData, pinCode: e.target.value.replace(/\D/, "") })
          }
          minLength="6"
          maxLength="6"
          required
          className="input"
        />
  
        <input
          type="text"
          placeholder="Party Name"
          value={formData.partyName}
          onChange={(e) => setFormData({ ...formData, partyName: e.target.value.toUpperCase() })}
          required
          className="input"
        />
  
        <input
          type="url"
          placeholder="Party Logo URL"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="input"
        />
  
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="input"
        />
  
        {emailError && <p className="error-text">{emailError}</p>}
  
        <div className="select-container">
          <label>Select State:</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="select"
            required
          >
            <option value="">Select State</option>
            {Object.keys(statesData).map((stateKey) => (
              <option key={stateKey} value={stateKey}>
                {statesData[stateKey].name}
              </option>
            ))}
          </select>
        </div>
  
        {seats.length > 0 && (
          <div className="select-container">
            <label>Select Seat:</label>
            <select
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              className="select"
              required
            >
              <option value="">Select Seat</option>
              {seats.map((seatOption, index) => (
                <option key={index} value={seatOption}>
                  {seatOption}
                </option>
              ))}
            </select>
          </div>
        )}
  
        <button type="submit" className="button">Register</button>
      </form>
    )}
  
    {showSuccessPopup && (
      <div className="popup">
        <p className="popup-text">Registration Successful!</p>
        <button onClick={handlePopupClose} className="close-button">
          Close
        </button>
      </div>
    )}
  </div>
  );
  
};

export default PoliticalPartiesRegister;
