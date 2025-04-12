import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import "./mainapp.css";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import adminProfile from './images/admin_profile.jpg';
import iliganLogo from './images/iligan_logo.png';
import brgyLogo from './images/brgy-logo.jpg';
//Import your components
import Dashboard from "./components/Dashboard";
import Residents from "./components/Residents";
import Households from "./components/Households";
import SocioEconomic from "./components/SocioEconomic";
import DataVisualization from "./components/DataVisualization";
import Documents from "./components/Documents";
import IncidentReporting from "./components/IncidentReporting";

function Mainapp() {
    const storedComponent = localStorage.getItem("activeComponent") || "dashboard";
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeComponent, setActiveComponent] = useState(storedComponent);
    const navigate = useNavigate(); 

    useEffect(() => {
        localStorage.setItem("activeComponent", activeComponent);
    }, [activeComponent]);

    const [islogoutModalOpen, setislogoutModalOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated"); // Clear authentication state
        localStorage.removeItem("activeComponent"); // Clear stored active component
        navigate("/"); // Redirect back to home (signin page)
    };

    // Map components to state values
    const componentsMap = {
        dashboard: <Dashboard setActiveComponent={setActiveComponent}/>,
        residents: <Residents />,
        households: <Households />,
        documents: <Documents />,
        socioeconomic: <SocioEconomic />,
        datavisual: <DataVisualization setActiveComponent={setActiveComponent} />,
        incidentreporting: <IncidentReporting />
    };

    return (
        <div className="mainappcontainer">
            {/* Sidebar */}
            <div className={`mainappsidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
                <i 
                    className="bi bi-list toggle-icon"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                ></i>

                {!isSidebarCollapsed && (
                    <>
                        <img src={adminProfile} alt="Admin Profile" id="adminProfile" />
                        <p id="mainappadmin">Admin</p>
                    </>
                )}

                <div className="mainappoptions">
                    <div className={`option ${activeComponent === "dashboard" ? "active-option" : ""}`} onClick={() => setActiveComponent("dashboard")}>
                        <i className="bi bi-house-fill"></i> <span>{!isSidebarCollapsed && "Dashboard"}</span>
                    </div>
                    <div className={`option ${activeComponent === "residents" ? "active-option" : ""}`} onClick={() => setActiveComponent("residents")}>
                        <i className="bi bi-file-person-fill"></i> <span>{!isSidebarCollapsed && "Residents"}</span>
                    </div>
                    <div className={`option ${activeComponent === "households" ? "active-option" : ""}`} onClick={() => setActiveComponent("households")}>
                        <i className="bi bi-people-fill"></i> <span>{!isSidebarCollapsed && "Households"}</span>
                    </div>
                    <div className={`option ${activeComponent === "socioeconomic" ? "active-option" : ""}`} onClick={() => setActiveComponent("socioeconomic")}>
                        <i className="bi bi-bank"></i> <span>{!isSidebarCollapsed && "Socio-Economic"}</span>
                    </div>
                    <div className={`option ${activeComponent === "datavisual" ? "active-option" : ""}`} onClick={() => setActiveComponent("datavisual")}>
                        <i className="bi bi-bar-chart-fill"></i> <span>{!isSidebarCollapsed && "Data Visualization"}</span>
                    </div>
                    <div className={`option ${activeComponent === "documents" ? "active-option" : ""}`} onClick={() => setActiveComponent("documents")}>
                        <i className="bi bi-file-earmark-text-fill"></i> <span>{!isSidebarCollapsed && "Documents"}</span>
                    </div>
                    <div className={`option ${activeComponent === "incidentreporting" ? "active-option" : ""}`} onClick={() => setActiveComponent("incidentreporting")}>
                        <i className="bi bi-exclamation-triangle-fill"></i> <span>{!isSidebarCollapsed && "Incident Reporting"}</span>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="logout-btn" onClick={() => setislogoutModalOpen(true)}>
                    <i className="bi bi-box-arrow-right"></i> <span>{!isSidebarCollapsed && "Logout"}</span>
                </div>
            </div>

            {/* Right Side */}
            <div className="mainapprightside">
                <div className="mainapptop">
                    <img src={brgyLogo} alt="Barangay Logo" id="brgylogo" />
                    <div id="signintitle">Del Carmen Profiling System</div>
                    <img src={iliganLogo} alt="Iligan City Logo" id="iliganlogo"/>
                </div>
 
                <div className="mainappmainpart">
                    {componentsMap[activeComponent]}
                </div>
            </div>
            
            
            {/**Modal for logout */}
            {islogoutModalOpen && (
                <>
                <div className="modal-backdrop fade show"></div>
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" onClick={() => setislogoutModalOpen(false)} className="btn-close" aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <h5 className="modal-title">Are you sure you want to logout?</h5>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary"  onClick={() => setislogoutModalOpen(false)}>Close</button>
                                <button type="button"onClick={handleLogout} className="btn btn-primary">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}

        </div>
    );
}

export default Mainapp;