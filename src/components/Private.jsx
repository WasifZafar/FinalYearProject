import { useNavigate } from "react-router-dom";
import "./style.css";

const Private = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcom To Admin Private Page...</h1>
      <div className="button-cover">
      <button className="button1" onClick={() => navigate("/FinalYearProject/admin-panel")}>
       Admin Page
      </button>
      <button className="button1" onClick={() => navigate("/FinalYearProject/vote-count")}>
       Vote Count
      </button>
    </div>
    </div>
  );
};

export default Private;
