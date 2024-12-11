import { useNavigate } from "react-router-dom";
import "./style.css";

const ElectoralPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcome Voter To Voting Page... </h1>
      <div className="button-cover">
      <button className="button1" onClick={() => navigate("/FinalYearProject/vote")}>
       Main Voting
      </button>
      <button className="button1" onClick={() => navigate("/FinalYearProject/test-vote")}>
       Test Voting
      </button></div>
    </div>
  );
};

export default ElectoralPage;
