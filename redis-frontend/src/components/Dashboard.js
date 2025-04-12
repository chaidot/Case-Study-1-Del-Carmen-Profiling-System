import "./dashboard.css";
import Card from "./Card";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { PieChart, Pie, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

const API_URL = 'http://localhost:5000/residents';

function Dashboard({ setActiveComponent }){
    const [residents, setResidents] = useState([]);
    const [genderData, setGenderData] = useState([]);
    const [ageData, setAgeData] = useState([]);
    const [maritalStatusData, setMaritalStatusData] = useState([]);
    const [employmentStatusData, setEmploymentStatusData] = useState([]);
    
    const fetchResidents = async () => {
        try {
          const response = await axios.get(API_URL); 
            const sortedResidents = response.data.sort((a, b) => b.id - a.id);
          setResidents(sortedResidents);
            processData(sortedResidents);
        } catch (error) {
            if (error.code === 'ERR_NETWORK' || error.message.includes('Connection refused')) {
                toast.error('Cannot connect to server. Please make sure the backend server is running on port 5000.');
                console.error('Server connection error:', error);
            } else {
                toast.error('Error fetching residents: ' + (error.response?.data?.message || error.message));
            }
        }
      };
  
      useEffect(() => {
          fetchResidents();
    }, []);

    const processData = (residents) => {
        // Process gender data
        const genderCounts = residents.reduce((acc, resident) => {
            acc[resident.sex] = (acc[resident.sex] || 0) + 1;
            return acc;
        }, {});

        setGenderData(Object.entries(genderCounts).map(([name, value]) => ({
            name,
            value
        })));

        // Process age data
        const ageGroups = {
            '0-17': 0,
            '18-30': 0,
            '31-50': 0,
            '51-70': 0,
            '70+': 0
        };

        residents.forEach(resident => {
            const age = calculateAge(resident.birthdate);
            if (age <= 17) ageGroups['0-17']++;
            else if (age <= 30) ageGroups['18-30']++;
            else if (age <= 50) ageGroups['31-50']++;
            else if (age <= 70) ageGroups['51-70']++;
            else ageGroups['70+']++;
        });

        setAgeData(Object.entries(ageGroups).map(([name, value]) => ({
            name,
            value
        })));

        // Process marital status data
        const maritalStatusCounts = residents.reduce((acc, resident) => {
            acc[resident.maritalStatus] = (acc[resident.maritalStatus] || 0) + 1;
            return acc;
        }, {});

        setMaritalStatusData(Object.entries(maritalStatusCounts).map(([name, value]) => ({
            name,
            value
        })));

        // Process employment status data
        const employmentStatusCounts = residents.reduce((acc, resident) => {
            acc[resident.employmentStatus] = (acc[resident.employmentStatus] || 0) + 1;
            return acc;
        }, {});

        setEmploymentStatusData(Object.entries(employmentStatusCounts).map(([name, value]) => ({
            name,
            value
        })));
    };

    const calculateAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
            </div>

            <div className="dashboard-grid">
                {/* Stats Cards Row */}
                <div className="stats-row">
                    {/* Total Residents Card */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <i className="bi bi-people"></i>
                        </div>
                        <div className="card-content">
                            <h3>Total Residents</h3>
                            <p className="card-value">{residents.length}</p>
                        </div>
                    </div>

                    {/* Employed Residents Card */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <i className="bi bi-briefcase"></i>
                        </div>
                        <div className="card-content">
                            <h3>Employed Residents</h3>
                            <p className="card-value">
                                {residents.filter(r => r.employmentStatus === "Employed").length}
                            </p>
                        </div>
                    </div>

                    {/* Senior Citizens Card */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <i className="bi bi-person-workspace"></i>
                        </div>
                        <div className="card-content">
                            <h3>Senior Citizens</h3>
                            <p className="card-value">
                                {residents.filter(r => r.isSeniorCitizen?.toLowerCase() === "yes" || r.isSeniorCitizen?.toLowerCase() === "true").length}
                            </p>
                        </div>
                    </div>

                    {/* 4Ps Beneficiaries Card */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <i className="bi bi-heart"></i>
                        </div>
                        <div className="card-content">
                            <h3>4Ps Beneficiaries</h3>
                            <p className="card-value">
                                {residents.filter(r => r.is4Ps === "yes").length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    {/* Gender Distribution */}
                    <div className="chart-card">
                        <h3>Gender Distribution</h3>
                        <PieChart width={400} height={300}>
                            <Pie
                                data={genderData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label
                            />
                            <Tooltip />
                        </PieChart>
                    </div>

                    {/* Age Distribution */}
                    <div className="chart-card">
                        <h3>Age Distribution</h3>
                        <BarChart width={400} height={300} data={ageData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#4CAF50" />
                        </BarChart>
                    </div>

                    {/* Marital Status Distribution */}
                    <div className="chart-card">
                        <h3>Marital Status Distribution</h3>
                        <PieChart width={400} height={300}>
                            <Pie
                                data={maritalStatusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label
                            />
                            <Tooltip />
                        </PieChart>
                    </div>

                    {/* Employment Status Distribution */}
                    <div className="chart-card">
                        <h3>Employment Status Distribution</h3>
                        <BarChart width={400} height={300} data={employmentStatusData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#4CAF50" />
                        </BarChart>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Dashboard;