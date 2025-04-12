import Card from "./Card";
import "./dataVisualization.css";
import React, { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';
import { Chart } from "react-google-charts";

const API_URL = "http://localhost:5000/residents";

function SocioEcoReports({ setActiveComponent }) {
  const [residents, setResidents] = useState([]);
  const [employmentData, setEmploymentData] = useState([]);
  const [fourPsData, setFourPsData] = useState([]);
  const [seniorCitizenData, setSeniorCitizenData] = useState([]);
  const [philhealthData, setPhilhealthData] = useState([]);

  const fetchResidents = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/residents');
      if (!response.ok) {
        throw new Error('Failed to fetch residents');
      }
      const data = await response.json();
      setResidents(data);
      processData(data);
    } catch (error) {
      toast.error('Error fetching residents: ' + error.message);
    }
  }, []);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const processData = (residents) => {
    let employmentCount = { Employed: 0, Unemployed: 0 };
    let fourPsCount = { Yes: 0, No: 0 };
    let seniorCitizenCount = { Yes: 0, No: 0 };
    let philhealthCount = { Yes: 0, No: 0 };

    residents.forEach((resident) => {
      let employmentKey = resident.employmentStatus?.toLowerCase().trim() === "employed" ? "Employed" : "Unemployed";
      employmentCount[employmentKey]++;

      let fourPsKey = resident.is4Ps?.toLowerCase().trim() === "yes" ? "Yes" : "No";
      fourPsCount[fourPsKey]++;

      let seniorKey = resident.isSeniorCitizen?.toLowerCase().trim() === "yes" ? "Yes" : "No";
      seniorCitizenCount[seniorKey]++;

      let philhealthKey = resident.isPhilhealthMember?.toLowerCase().trim() === "yes" ? "Yes" : "No";
      philhealthCount[philhealthKey]++;
    });

    setEmploymentData([
      ["Employment Status", "Residents", { role: "style" }],
      ["Employed", employmentCount.Employed, "#00bf63"],
      ["Unemployed", employmentCount.Unemployed, "#00bf63"],
    ]);

    setFourPsData([
      ["4Ps Membership", "Residents", { role: "style" }],
      ["Yes", fourPsCount.Yes, "#00bf63"],
      ["No", fourPsCount.No, "#00bf63"],
    ]);

    setSeniorCitizenData([
      ["Senior Citizen", "Residents", { role: "style" }],
      ["Yes", seniorCitizenCount.Yes, "#00bf63"],
      ["No", seniorCitizenCount.No, "#00bf63"],
    ]);

    setPhilhealthData([
      ["PhilHealth Membership", "Residents", { role: "style" }],
      ["Yes", philhealthCount.Yes, "#00bf63"],
      ["No", philhealthCount.No, "#00bf63"],
    ]);
  };

  return (
    <>
      <div className="demographicreportscard">
        <div className="col-md-4">
          <Card className="h-100">
            <h5 className="text-lg font-bold csscardtitle">Total Number of Employed:</h5>
            <p className="text-xl" id="datavisualizatiototaltext">
              {residents.filter((resident) => resident.employmentStatus?.toLowerCase().trim() === "employed").length}
            </p>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100">
            <h5 className="text-lg font-bold csscardtitle">Total Number of Unemployed:</h5>
            <p className="text-xl" id="datavisualizatiototaltext">
              {residents.filter((resident) => resident.employmentStatus?.toLowerCase().trim() === "unemployed").length}
            </p>
          </Card>
        </div>
      </div>
      <h5 className="text-lg font-bold csscardtitle" id="viewemploymentdata" onClick={() => setActiveComponent("socioeconomic")}>
        View Employment Data
      </h5>
      <div className="p-6" id="demographiccharts">
        <div className="demographicchart">
          <h5 className="text-lg font-bold demographiccharttitle">Employment Status</h5>
          <Chart chartType="BarChart" width="600px" height="300px" data={employmentData} options={{ legend: { position: "none" }}}/>
        </div>
        <div className="demographicchart">
          <h5 className="text-lg font-bold mt-6 demographiccharttitle">4Ps Membership Status</h5>
          <Chart chartType="BarChart" width="600px" height="300px" data={fourPsData} options={{ legend: { position: "none" }}}/>
        </div>
        <div className="demographicchart">
          <h5 className="text-lg font-bold mt-6 demographiccharttitle">Senior Citizen Status</h5>
          <Chart chartType="BarChart" width="600px" height="300px" data={seniorCitizenData} options={{ legend: { position: "none" }}}/>
        </div>
        <div className="demographicchart">
          <h5 className="text-lg font-bold mt-6 demographiccharttitle">PhilHealth Membership Status</h5>
          <Chart chartType="BarChart" width="600px" height="300px" data={philhealthData} options={{ legend: { position: "none" }}}/>
        </div>
      </div>
    </>
  );
}

export default SocioEcoReports;