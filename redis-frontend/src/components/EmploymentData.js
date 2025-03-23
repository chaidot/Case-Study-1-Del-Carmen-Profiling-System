import Card from "./Card";
import "./socioeconomic.css";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/residents';

function EmploymentData(){
    const [residents, setResidents] = useState([]);
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [searchedResidents, setsearchedResidents] = useState([]);
    const [filterColumns, setfilterColumns] = useState(false);
    const [employedResidents, setemployedResidents] = useState([]);
    const [unemployedResidents, setunemployedResidents] = useState([]);
    const [residentsinTable, setresidentsinTable] = useState("All");


    const fetchResidents = async () => {
        try {
          const response = await axios.get(API_URL); 
          const sortedResidents = response.data.sort((a, b) => b.id - a.id); // Sort by id in descending order (asc a.id - b.id)
          setResidents(sortedResidents);
          setFilteredResidents(sortedResidents);
          setsearchedResidents(sortedResidents);
        } catch (error) {
          toast.error('Error fetching residents:', error);
        }
    };

    // Fetch residents when the component mounts
    useEffect(() => {
        fetchResidents();
    }, []);

   // Function to filter employed residents
    const filterEmployed = () => {
        const employed = residents.filter(resident => resident.employmentStatus === "Employed");
        setemployedResidents(employed);
    };

    // Function to filter unemployed residents
    const filterUnemployed = () => {
        const unemployed = residents.filter(resident => resident.employmentStatus === "Unemployed");
        setunemployedResidents(unemployed);
    };

    // Run filtering only AFTER `residents` has been updated
    useEffect(() => {
        if (residents.length > 0) {
            filterEmployed();
            filterUnemployed();
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

    // Function to calculate months employed
    const calculateMonthsEmployed = (date) => {
        if (!date) return ''; // Return empty if no date is selected

        const startDate = new Date(date);
        const today = new Date();

        let months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());

        return months < 0 ? 0 : months; // Prevent negative values
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
        console.log("searchTerm:", searchTerm)
        console.log("searchby:", inputValueSearchBy)

        if (searchTerm.length > 0){
        const filtered = searchedResidents.filter(resident => {
            const searchValue = searchTerm.toLowerCase();
            if (inputValueSearchBy === "firstname") {
                return resident.firstname.toLowerCase().includes(searchValue);
            } else if (inputValueSearchBy === "lastname") {
                return resident.lastname.toLowerCase().includes(searchValue);
            }else if (inputValueSearchBy === "sex") {
                return resident.sex.toLowerCase() === searchValue.toLowerCase();
            } else if (inputValueSearchBy === "age") {
                const residentAge = calculateAge(resident.birthdate);
                return isAgeInRange(searchTerm, residentAge);
            } else if (inputValueSearchBy === "monthsEmployed") {
                const residentAge = calculateMonthsEmployed(resident.dateStarted);
                {/*return calculateMonthsEmployed(resident.dateStarted).toString().includes(searchValue);*/}
                return isAgeInRange(searchTerm, residentAge);
            } else if (inputValueSearchBy === "occupation") {
                return resident.occupation.toLowerCase().includes(searchValue);
            } else if (inputValueSearchBy === "monthlyIncome") {
                {/*return calculateMonthsEmployed(resident.dateStarted).toString().includes(searchValue);*/}
                return isAgeInRange(searchTerm, resident.monthlyIncome);
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
                    <h5 className="text-lg font-bold csscardtitle">Total Number of Employed:</h5>
                    <p className="text-xl" id="socioeconomictotaltext"> {employedResidents.length}</p>
                    {/*<p className="text-xl">{totalItems}</p>*/}
                    <p className="text-xl" id="socioeconomicviewmore" onClick={() => {setFilteredResidents(employedResidents); setfilterColumns(false); setsearchedResidents(employedResidents);setresidentsinTable("Employed")}}>View More</p>
                </Card>
            </div>
            <div className="col-md-4">
                <Card className="h-100">
                    <h5 className="text-lg font-bold csscardtitle">Total Number of Unemployed:</h5>
                    <p className="text-xl" id="socioeconomictotaltext"> {unemployedResidents.length}</p>
                    {/*<p className="text-xl">{totalItems}</p>*/}
                    <p className="text-xl" id="socioeconomicviewmore" onClick={() => {setFilteredResidents(unemployedResidents); setfilterColumns(true); setsearchedResidents(unemployedResidents); setresidentsinTable("Unemployed")}}> View More</p>
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
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("firstname");setTypeOfInput("text"); fetchResidents(); setSearchTerm(""); setfilterColumns(false); setsearchedResidents(residents);setresidentsinTable("All")}} href="#">All</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("firstname");setTypeOfInput("text");}} href="#">Firstname</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("lastname");setTypeOfInput("text");}}href="#">Lastname</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("sex");setTypeOfInput("text");}}href="#">Sex</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("age");setTypeOfInput("text");}}href="#">Age</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("occupation");setTypeOfInput("text");}}href="#">Occupation</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("monthsEmployed");setTypeOfInput("text");}}href="#">Months Employed</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("monthlyIncome");setTypeOfInput("text");}}href="#">Monthly Income</a></li>
                        </ul>
                    </div>
                    <input type={`${typeOfInput}`} placeholder={`Enter ${inputValueSearchBy}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} class="form-control" aria-label="Username" aria-describedby="basic-addon1"/>
                </div>
                <button type="button" class="btn btn-success" id="searchsocioeconomicsbutton" onClick={handleSearch}>Search</button>
            </div>

            </div>
            <div className="table-container">
                <table className="table table-striped table-hover" id="employmentdatatable">
                    <thead className="table-success">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Firstname</th>
                            <th scope="col">Lastname</th>
                            <th scope="col">Sex</th>
                            <th scope="col">Age</th>
                            {!filterColumns && (
                            <>
                                <th scope="col">Occupation</th>
                                <th scope="col">Months Employed</th>
                                <th scope="col">Monthly Income</th>
                            </>
                            )}
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
                                {!filterColumns && (
                                <>
                                    <td>{resident.occupation}</td>
                                    <td>{calculateMonthsEmployed(resident.dateStarted)}</td>
                                    <td>{resident.monthlyIncome}</td>
                                </>
                                )}
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

export default EmploymentData;