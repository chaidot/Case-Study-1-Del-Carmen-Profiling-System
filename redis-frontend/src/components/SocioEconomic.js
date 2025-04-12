import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./socioeconomic.css";

// Import the components for each option
import EmploymentData from "./EmploymentData";
import EducationData from "./EducationData";
import PovertyWelfare from "./PovertyWelfare";

function SocioEconomic() {
    
    // State to track which component should be displayed
    const [selectedOption, setSelectedOption] = useState("Employment Data");

    // Function to render the selected component
    const renderComponent = () => {
        switch (selectedOption) {
            case "Employment Data":
                return <EmploymentData />;
            case "Education Data":
                return <EducationData />;
            case "Poverty & Welfare Program":
                return <PovertyWelfare />;
            default:
                return null;
        }
    };

    return (
        <div className="socioeconomiccontainer">
            <div className="socioeconomictop">
                <h5 
                    className={`text-lg font-bold socioeconomicoption ${selectedOption === "Employment Data" ? "active" : ""}`}
                    onClick={() => setSelectedOption("Employment Data")}
                >
                    Employment Data
                </h5>
                <h5 
                    className={`text-lg font-bold socioeconomicoption ${selectedOption === "Education Data" ? "active" : ""}`}
                    onClick={() => setSelectedOption("Education Data")}
                >
                    Education Data
                </h5>
                <h5 
                    className={`text-lg font-bold socioeconomicoption ${selectedOption === "Poverty & Welfare Program" ? "active" : ""}`}
                    onClick={() => setSelectedOption("Poverty & Welfare Program")}
                >
                    Poverty & Welfare Program
                </h5>
            </div>
            
            {/* Render the selected component */}
            {renderComponent()}
        </div>
    );
}

export default SocioEconomic;