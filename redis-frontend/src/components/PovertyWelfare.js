import Card from "./Card";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/residents';

function PovertyWelfare(){

    const [residents, setResidents] = useState([]);
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [searchedResidents, setsearchedResidents] = useState([]);
    const [fourPSResidents, setfourPSResidents] = useState([]);
    const [seniorCitizenResidents, setseniorResidents] = useState([]);
    const [philhealthResidents, setphilhealthResidents] = useState([]);
    const [residentsinTable, setresidentsinTable] = useState("All Beneficiaries");


    const fetchResidents = async () => {
        try {
            const response = await axios.get(API_URL);
            const sortedResidents = response.data.sort((a, b) => b.id - a.id);

            const beneficiariesResidents = sortedResidents.filter(resident => 
                resident.is4ps === "yes" || 
                resident.isSeniorCitizen === "yes" || 
                resident.isPhilhealthMember === "yes"
            );    

            setResidents(beneficiariesResidents);
            setFilteredResidents(beneficiariesResidents); // Set the default view
            setsearchedResidents(beneficiariesResidents);
        } catch (error) {
            toast.error('Error fetching residents:', error);
        }
    };
    
    // Fetch residents when the component mounts
    useEffect(() => {
        fetchResidents();
    }, []);
    
    //Run filtering directly inside `useEffect`
    useEffect(() => {
        if (residents.length > 0) {
            setfourPSResidents(residents.filter(resident => resident.is4ps && resident.is4ps.toLowerCase() === "yes"));
            setseniorResidents(residents.filter(resident => resident.isSeniorCitizen && resident.isSeniorCitizen.toLowerCase() === "yes"));
            setphilhealthResidents(residents.filter(resident => resident.isPhilhealthMember && resident.isPhilhealthMember.toLowerCase() === "yes"));
        }
    }, [residents]); // Runs only when `residents` updates
    
    
    // Function to calculate age
    const calculateAge = (date) => {
        if (!date) return ""; // If no date is selected, return empty

        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // If birthdate hasn't occurred this year yet, subtract 1
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    //Search
    //Searchby dropdown
    const [inputValueSearchBy, setInputSearchBy] = useState("firstname");
    const [typeOfInput, setTypeOfInput] = useState("text");
    
    // Function to update the input field when a dropdown residents is selected
    const handleSearchByInputChange = (e) => {
        setInputSearchBy(e.target.value);
    };

    const [searchTerm, setSearchTerm] = useState('');

    // Function to check if an age is within the searched range
    const isAgeInRange = (searchTerm, age) => {
        searchTerm = searchTerm.trim();

        // Match patterns like "1-18", "60-", "-18"
        const rangePattern = /^(\d*)-(\d*)$/;
        const match = searchTerm.match(rangePattern);

        if (match) {
            const minAge = match[1] ? parseInt(match[1], 10) : null;
            const maxAge = match[2] ? parseInt(match[2], 10) : null;

            if (minAge !== null && maxAge !== null) {
                return age >= minAge && age <= maxAge;
            } else if (minAge !== null) {
                return age >= minAge;
            } else if (maxAge !== null) {
                return age <= maxAge;
            }
        } else if (!isNaN(searchTerm)) {
            return age === parseInt(searchTerm, 10);
        }

        return false;
    };

    const handleSearch = () => {

        if (searchTerm.length > 0) {
            const filtered = searchedResidents.filter(resident => {
                const searchValue = searchTerm.toLowerCase();
                if (inputValueSearchBy === "firstname") {
                    return resident.firstname && resident.firstname.toLowerCase().includes(searchValue);
                } else if (inputValueSearchBy === "lastname") {
                    return resident.lastname && resident.lastname.toLowerCase().includes(searchValue);
                } else if (inputValueSearchBy === "sex") {
                    return resident.sex.toLowerCase() === searchValue.toLowerCase();
                } else if (inputValueSearchBy === "age") {
                    const residentAge = calculateAge(resident.birthdate);
                    return isAgeInRange(searchTerm, residentAge);
                }
                return false;
            });
            setFilteredResidents(filtered);
        }
    };

    return(
        <>
        <div className="socioeconomiccard">
            <div className="col-md-4">
                <Card className="h-100">
                    <h5 className="text-lg font-bold csscardtitle">Total Number of 4p’s Beneficiaries:</h5>
                    <p className="text-xl" id="socioeconomictotaltext">{fourPSResidents.length}</p>
                    {/*<p className="text-xl">{totalItems}</p>*/}
                    <p className="text-xl" id="socioeconomicviewmore" onClick={() => {setFilteredResidents(fourPSResidents);setsearchedResidents(fourPSResidents); setsearchedResidents(fourPSResidents);setresidentsinTable("4Ps")}}>View More</p>
                </Card>
            </div>
            <div className="col-md-4">
                <Card className="h-100">
                    <h5 className="text-lg font-bold csscardtitle">Senior Cetizen Beneficiaries:</h5>
                    <p className="text-xl" id="socioeconomictotaltext">{seniorCitizenResidents.length}</p>
                    {/*<p className="text-xl">{totalItems}</p>*/}
                    <p className="text-xl" id="socioeconomicviewmore" onClick={() => {setFilteredResidents(seniorCitizenResidents);setsearchedResidents(seniorCitizenResidents); setsearchedResidents(seniorCitizenResidents);setresidentsinTable("Senior Citizen")}}>View More</p>
                </Card>
            </div>
            <div className="col-md-4">
                <Card className="h-100">
                    <h5 className="text-lg font-bold csscardtitle">PhilHealth Beneficiaries:</h5>
                    <p className="text-xl" id="socioeconomictotaltext">{philhealthResidents.length}</p>
                    {/*<p className="text-xl">{totalItems}</p>*/}
                    <p className="text-xl" id="socioeconomicviewmore" onClick={() => {setFilteredResidents(philhealthResidents);setsearchedResidents(philhealthResidents); setsearchedResidents(philhealthResidents);setresidentsinTable("PhilHealth")}}>View More</p>
                </Card>
            </div>
        </div>
        <div className="socioeconomictable">
            <div className="socioeconomicstoppart">
                <div id="educationfilter">{residentsinTable}</div>
                <div className="socioeconomicstopright">
                <div class="input-group mb-3" id="searchsocioeconomicinput">
                    <div class="dropdown">
                        <button class="btn btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" onChange={handleSearchByInputChange}>
                            {`Search by ${inputValueSearchBy}`}
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("firstname");setTypeOfInput("text"); fetchResidents(); setSearchTerm("");setsearchedResidents(residents); setresidentsinTable("All Beneficiaries")}} href="#">All</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("firstname");setTypeOfInput("text");}} href="#">Firstname</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("lastname");setTypeOfInput("text");}}href="#">Lastname</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("sex");setTypeOfInput("text");}}href="#">Sex</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("age");setTypeOfInput("text");}}href="#">Age</a></li>
                        </ul>
                    </div>
                    <input type={`${typeOfInput}`} placeholder={`Enter ${inputValueSearchBy}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} class="form-control" aria-label="Username" aria-describedby="basic-addon1"/>
                </div>
                <button type="button" class="btn btn-success" id="searchsocioeconomicsbutton" onClick={handleSearch}>Search</button>
            </div>

            </div>
            <div className="table-container">
            <table class="table table-striped table-hover" id="employmentdatatable">
                <thead class="table-success">
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Firstname</th>
                        <th scope="col">Lastname</th>
                        <th scope="col">Sex</th>
                        <th scope="col">Age</th>
                        <th scope="col">4Ps</th>
                        <th scope="col">Senior Citizen</th>
                        <th scope="col">PhilHealth</th>
                    </tr>
                </thead>
                <tbody>
                {filteredResidents.map((resident) => (
                        <tr key={resident.id}>
                            <td>{resident.id}</td>
                            <td>{resident.firstname}</td>
                            <td>{resident.lastname}</td>
                            <td>{resident.sex}</td>
                            <td>{calculateAge(resident.birthdate).toString()}</td>
                            <td>{resident.is4Ps}</td>
                            <td>{resident.isSeniorCitizen}</td>
                            <td>{resident.isPhilhealthMember}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            <p className="resultstext">Results: ({filteredResidents.length}) total rows</p>
        </div>
        <ToastContainer/>
        </>
    );
}

export default PovertyWelfare;