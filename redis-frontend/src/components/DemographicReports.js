import Card from "./Card";
import "./dataVisualization.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Chart } from "react-google-charts";

const API_URL = "http://localhost:5000/residents";

function DemographicReports({ setActiveComponent }) {
  const [residents, setResidents] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [sexRatio, setSexRatio] = useState([]);
  const [religionDistribution, setReligionDistribution] = useState([]);
  const [purokDistribution, setPurokDistribution] = useState([]);

  const fetchResidents = async () => {
    try {
      const response = await axios.get(API_URL);
      const sortedResidents = response.data.sort((a, b) => b.id - a.id);
      setResidents(sortedResidents);
      processData(sortedResidents);
    } catch (error) {
      toast.error("Error fetching residents:", error);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const calculateAge = (date) => {
    if (!date) return "";
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const processData = (residents) => {
    let ageGroups = {
      "0-10": 0,
      "11-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51-60": 0,
      "61+": 0,
    };
    let sexCount = { Male: 0, Female: 0 };
    let religionCount = {};
    let purokCount = {};

    residents.forEach((resident) => {
      let age = calculateAge(resident.birthdate);
      if (age <= 10) ageGroups["0-10"]++;
      else if (age <= 20) ageGroups["11-20"]++;
      else if (age <= 30) ageGroups["21-30"]++;
      else if (age <= 40) ageGroups["31-40"]++;
      else if (age <= 50) ageGroups["41-50"]++;
      else if (age <= 60) ageGroups["51-60"]++;
      else ageGroups["61+"]++;

      if (resident.sex === "Male") sexCount.Male++;
      if (resident.sex === "Female") sexCount.Female++;

      if (resident.religion) {
        religionCount[resident.religion] = (religionCount[resident.religion] || 0) + 1;
      }

      if (resident.purok) {
        purokCount[resident.purok] = (purokCount[resident.purok] || 0) + 1;
      }
    });

    setAgeDistribution([
      ["Age Group", "Number of Residents"],
      ...Object.entries(ageGroups),
    ]);

    setSexRatio([
      ["Sex", "Number of Residents"],
      ["Male", sexCount.Male],
      ["Female", sexCount.Female],
    ]);

    setReligionDistribution([
      ["Religion", "Number of Residents"],
      ...Object.entries(religionCount),
    ]);

    setPurokDistribution([
      ["Purok", "Number of Residents"],
      ...Object.entries(purokCount),
    ]);
  };


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

  return (
    <>
      <div className="demographicreportscard">
        <div className="col-md-4">
          <Card className="h-100">
            <h5 className="text-lg font-bold csscardtitle">Total Number of Residents:</h5>
            <p className="text-xl" id="datavisualizatiototaltext">{residents.length}</p>
            <p className="text-xl" id="datavisualizatioviewmore" onClick={() => setActiveComponent("residents")}>
              View all Residents
            </p>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100">
            <h5 className="text-lg font-bold csscardtitle">Total Number of Households:</h5>
            <p className="text-xl" id="datavisualizatiototaltext">{fetchedHouseholdData.length}</p>
            <p className="text-xl" id="datavisualizatioviewmore" onClick={() => setActiveComponent("households")}>
              View all Households
            </p>
          </Card>
        </div>
      </div>
      <div className="p-6" id="demographiccharts">
        <div className="demographicchart">
            <h5 className="text-lg font-bold demographiccharttitle">Age Distribution</h5>
            <Chart chartType="Bar" width="600px" height="300px" data={ageDistribution}  options={{ legend: { position: "none" }, colors: ["#00bf63"]  }}/>
        </div>
        <div className="demographicchart">
            <h5 className="text-lg font-bold mt-6 demographiccharttitle">Sex Ratio</h5>
            <Chart chartType="PieChart" width="600px" height="300px" data={sexRatio} options={{ colors: ["#00bf63", "#66e09e"] }}/>
        </div>
        <div className="demographicchart">
            <h5 className="text-lg font-bold mt-6 demographiccharttitle">Religion Distribution</h5>
            <Chart chartType="PieChart" width="600px" height="300px" data={religionDistribution} options={{ colors: ["#00bf63", "#66e09e", "#99f0c3", "#33cc77"] }}/>
        </div>
        <div className="demographicchart">
            <h5 className="text-lg font-bold mt-6 demographiccharttitle">Residents by Purok</h5>
            <Chart chartType="Bar" width="600px" height="300px" data={purokDistribution}options={{ legend: { position: "none" }, colors: ["#00bf63"]  }}/>
        </div>
      </div>    
    </>
  );
}

export default DemographicReports;