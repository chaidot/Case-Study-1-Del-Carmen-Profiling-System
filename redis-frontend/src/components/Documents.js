import "./documents.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Papa from "papaparse";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/residents';

function Documents(){

    const [residents, setResidents] = useState([]);
    const [residentsTable, setResidentsTable] = useState(residents);

    // Fetch all ressidents
    const fetchResidents = async () => {
        try {
          const response = await axios.get(API_URL); 
          const sortedResidents = response.data.sort((a, b) => b.id - a.id); // Sort by id in descending order (asc a.id - b.id)
          setResidents(sortedResidents);
          setResidentsTable(sortedResidents);
        } catch (error) {
          toast.error('Error fetching residents:', error);
        }
      };
  
      useEffect(() => {
          fetchResidents();
    }, []);

    //Search
    //Searchby dropdown
    const [inputValueSearchBy, setInputSearchBy] = useState("firstname");
    const [typeOfInput, setTypeOfInput] = useState("text");
    // Function to update the input field when a dropdown residents is selected
    
    const handleSearchByInputChange = (e) => {
        setInputSearchBy(e.target.value);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResidents, setFilteredResidents] = useState([]);

    const handleSearch = () => {
        console.log("searchTerm:", searchTerm)
        console.log("searchby:", inputValueSearchBy)

        if (searchTerm.length > 0){
        const filtered = residents.filter(resident => {
            const searchValue = searchTerm.toLowerCase();
            if (inputValueSearchBy === "firstname") {
                return resident.firstname.toLowerCase().includes(searchValue);
            } else if (inputValueSearchBy === "lastname") {
                return resident.lastname.toLowerCase().includes(searchValue);
            }
            return false;
        });
        setFilteredResidents(filtered);
        setResidentsTable(filtered);
        }
    };
    return(
        <div className="documentscontainer">
            <div className="documentstoppart">
                <button type="button" class="btn btn-success" id="adddocumentsbutton">Create Document</button>
                {/*  onClick={() => {setopenAddHouseholdModal(true); setMode('Add'); setHouseholdData([])}} */}
                <div className="documentstopright">
                    <div class="input-group mb-3" id="searchdocumentinput">
                        <div class="dropdown">
                            <button class="btn btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" onChange={handleSearchByInputChange}>
                                {`Search by ${inputValueSearchBy}`}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" onClick={() => {setInputSearchBy("firstname");setTypeOfInput("text"); setResidentsTable(residents); setSearchTerm("")}} href="#">All</a></li>
                                <li><a class="dropdown-item" onClick={() => {setInputSearchBy("firstname");setTypeOfInput("text");}} href="#">Firstname</a></li>
                                <li><a class="dropdown-item" onClick={() => {setInputSearchBy("lastname");setTypeOfInput("text");}}href="#">Lastname</a></li>
                            </ul>
                        </div>
                        <input type={`${typeOfInput}`} placeholder={`Enter ${inputValueSearchBy}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} class="form-control" aria-label="Username" aria-describedby="basic-addon1"/>
                    </div>
                    <button type="button" class="btn btn-success" id="searchdocumentsbutton" onClick={handleSearch}>Search</button>
                    {/*onClick={handleSearch} */}
                </div>
            </div>
            <div className="documentstable">
                <div className="table-container">
                <table class="table table-striped table-hover">
                    <thead class="table-success">
                        <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Firstname</th>
                        <th scope="col">Lastname</th>
                        <th scope="col">Type</th>
                        <th scope="col">Date Created</th>
                        <th scope="col"></th>
                        <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {residentsTable.map((resident) => (
                            <tr key={resident.id}>
                                <td>{resident.id}</td>
                                <td>{resident.firstname}</td>
                                <td>{resident.lastname}</td>
                                <td>{resident.houseNumber}</td>
                                <td>{resident.purok}</td>
                                <td>
                                    <p className="text-xl text-primary cursor-pointer" id="residentsviewmore" >View more</p>{/* onClick={() => openModal("view", resident)} */}
                                </td>
                                <td>
                                    <button type="button" class="btn btn-success" id="residenteditbutton" >Create Document</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                <p className="resultstext">Results: ({residentsTable.length}) total rows</p>
            </div>
        </div>
    );
}

export default Documents;