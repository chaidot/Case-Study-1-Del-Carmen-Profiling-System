import "./dashboard.css";
import Card from "./Card";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const API_URL = 'http://localhost:5000/residents';

function Dashboard({ setActiveComponent }){
    const [residents, setResidents] = useState([]);
    
    const fetchResidents = async () => {
        try {
          const response = await axios.get(API_URL); 
          const sortedResidents = response.data.sort((a, b) => b.id - a.id); // Sort by id in descending order (asc a.id - b.id)
          setResidents(sortedResidents);
        } catch (error) {
          toast.error('Error fetching residents:', error);
        }
      };
  
      useEffect(() => {
          fetchResidents();
    }, []);


    //HOUSEHOLD

    const [fetchedHouseholdData, setFetchedHouseholdData] = useState([]);

    //Fetchiing household data
    const fetchHouseholdData = async () => {
        try {
        const response = await axios.get("http://localhost:5000/api/household");
        setFetchedHouseholdData(response.data);
        } catch (error) {
        console.error("Error fetching household data:", error);
        }
    };
    
    useEffect(() => {
        fetchHouseholdData(); // Fetch data on component mount
    }, []);

    return(
        <div className="dashboardcontainer">
            <div className="col-md-4">
                <Card className="h-100">
                    <h5 className="text-lg font-bold csscardtitle">Total Number of Residents:</h5>
                    <p className="text-xl" id="dashboardtotaltext">{residents.length}</p>
                    {/*<p className="text-xl">{totalItems}</p>*/}
                </Card>
            </div>
            <div className="col-md-4">
                <Card className="h-100">
                    <h5 className="text-lg font-bold csscardtitle">Total Number of Households:</h5>
                    <p className="text-xl" id="dashboardtotaltext">{fetchedHouseholdData.length}</p>
                    {/*<p className="text-xl">{totalItems}</p>*/}
                </Card>
            </div>
            <h5 className="text-lg font-bold csscardtitle" id="dashboardviewmore" onClick={() => setActiveComponent("datavisual")}>View More...</h5>
            <div className="dashboardadd">
                <button type="button" class="btn btn-success" id="dashboardaddresidentsbutton" onClick={() => setActiveComponent("residents")}>Add Resident</button>
                <button type="button" class="btn btn-success" id="dashboardaddhouseholdsbutton" onClick={() => setActiveComponent("households")}>Add Household</button>
            </div>
        <ToastContainer/>
        </div>
    );
}

export default Dashboard;