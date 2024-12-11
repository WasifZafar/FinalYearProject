import { useNavigate } from "react-router-dom";
import "./style.css";

const ElectoralPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcome Voter To Registration Page... </h1>
      <div className="button-cover">
      <button className="button1" onClick={() => navigate("/FinalYearProject/register-electoral")}>
       Elector Registar
      </button>
      <button className="button1" onClick={() => navigate("/FinalYearProject/update-elector")}>
       Update Elector
      </button></div>
    </div>
  );
};

export default ElectoralPage;
