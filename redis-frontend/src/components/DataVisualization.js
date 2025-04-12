import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./dataVisualization.css";

// Import the components for each option
import DemographicReports from "./DemographicReports";
import SocioEcoReports from "./SocioEcoReports";

function DataVisualization({ setActiveComponent }){
    const [selectedOption, setSelectedOption] = useState("Demographic Reports");

    const renderComponent = () => {
        switch (selectedOption) {
            case "Demographic Reports":
                return <DemographicReports setActiveComponent={setActiveComponent} />;
            case "Socio-economic Reports":
                return <SocioEcoReports setActiveComponent={setActiveComponent}/>;
            default:
                return null;
        }
    };

    return(
        <div className="datavisualizationcontainer">
            <div className="datavisualizationtop">
                <h5 
                    className={`text-lg font-bold datavisualizationoption ${selectedOption === "Demographic Reports" ? "active" : ""}`}
                    onClick={() => setSelectedOption("Demographic Reports")}
                >
                    Demographic Reports
                </h5>
                <h5 
                    className={`text-lg font-bold datavisualizationoption ${selectedOption === "Socio-economic Reports" ? "active" : ""}`}
                    onClick={() => setSelectedOption("Socio-economic Reports")}
                >
                    Socio-economic Reports
                </h5>
            </div>
            
            {/* Render the selected component */}
            {renderComponent()}
        </div>
    );
}

export default DataVisualization;