import "./residents.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Papa from "papaparse";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import Certification from './Certification.js';
import { useReactToPrint } from 'react-to-print';

const API_URL = 'http://localhost:5000/residents';

function Residents(){
    const [formData, setFormData] = useState({ firstname: '', middlename: '', lastname: '', suffix: '', sex: '', birthdate: '', maritalStatus: '', nationality: 'Filipino', religion: '', houseNumber: '', purok: '', barangay: 'Del Carmen', mobileNumber: '', email: '', isStudent: '', schoolLevel: '', grade: '', school: '', employmentStatus: '', occupation: '', dateStarted: '', monthlyIncome: '', is4Ps: '', isSeniorCitizen: '', isPhilhealthMember: '' });
    const [residents, setResidents] = useState([]);
    const [residentsTable, setResidentsTable] = useState(residents); //list of residents to be shown in the table


    const [age, setAge] = useState("");
    const [monthsEmployed, setmonthsEmployed] = useState("");

    // Handle form change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle sex dropdown change
    const handleSexChange = (sex) => {
        setFormData({ ...formData, sex });
    };

    // Handle marital status change
    const handleMaritalStatusChange = (status) => {
        setFormData({ ...formData, maritalStatus: status });
    };

    // Handle student status change
    const handleStudentStatusChange = (status) => {
        setFormData({ ...formData, isStudent: status });
    };

    // Handle school level change
    const handleSchoolLevelChange = (level) => {
        setFormData({ ...formData, schoolLevel: level });
    };

    // Handle employment status change
    const handleEmploymentStatusChange = (status) => {
        setFormData({ ...formData, employmentStatus: status });
    };

    // Handle 4Ps Beneficiary change
    const handle4PsChange = (e) => {
        setFormData({ ...formData, is4Ps: e.target.value });
    };

    // Handle PhilhealthMember Beneficiary change
    const handlePhilhealthMemberChange = (e) => {
        setFormData({ ...formData, isPhilhealthMember: e.target.value });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [mode, setMode] = useState("add"); // Can be 'add', 'edit', or 'view'
    const totalPages = 4; // Total number of pages

    //validation for each page making sure required inputs are not empty
    const validatePage = () => {
        if (currentPage === 1) {
            if (!formData.firstname || !formData.lastname || !formData.middlename || !formData.sex || !formData.birthdate || !formData.maritalStatus || !formData.nationality || !formData.religion) {
                toast.error("Please fill out all required fields before proceeding.");
                return false;
            }
        } else if (currentPage === 2) {
            if (!formData.houseNumber || !formData.purok || !formData.barangay) {
                toast.error("Please fill out all required fields before proceeding.");
                return false;
            }
        } else if (currentPage === 3) {
            if (!formData.isStudent || !formData.employmentStatus) {
                toast.error("Please fill out all required fields before proceeding.");
                return false;
                
            }
            if(formData.isStudent === "true"){
                if (!formData.schoolLevel || !formData.grade || !formData.school) {
                    toast.error("Please fill out all required fields before proceeding.");
                    return false;
                }
            }
            if(formData.employmentStatus === "Employed"){
                if (!formData.occupation || !formData.dateStarted) {
                    toast.error("Please fill out all required fields before proceeding.");
                    return false;
                }
            }
        } else if (currentPage === 4) {
            if (!formData.is4Ps || !formData.isSeniorCitizen || !formData.isPhilhealthMember) {
                toast.error("Please fill out all required fields before proceeding.");
                return false;
            }
        }
        return true; // Validation passed
    };

    //CRUD

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
  

    // Add new resident
    const handleAddResident = async (e) => {
        e.preventDefault();
        try {
            if (formData.isStudent === "false") {
                setFormData({ 
                    ...formData, 
                    schoolLevel: "", 
                    grade: "",
                    school: ""
                });
            }
            if (formData.employmentStatus === "Unemployed") {
                setFormData({ 
                    ...formData, 
                    occupation: '',
                    dateStarted: '',
                    monthlyIncome: ''
                });
            }
          await axios.post(API_URL, formData);
          toast.success('Resident added successfully!');
          fetchResidents();
          closeModal();
        } catch (error) {
          if (error.response && error.response.status === 409) {
            toast.warning(error.response.data.message); 
          } else {
            toast.error('Error adding resident!');
          }
        }
    };

    // Update existing resident
    const handleEditResident = async (e) => {
        e.preventDefault();
        try {    
            // Create a new updated formData object
            let updatedFormData = { ...formData };
    
            if (formData.isStudent === "false") {
                updatedFormData = {
                    ...updatedFormData,
                    schoolLevel: '',
                    grade: '',
                    school: ''
                };
            }
    
            if (formData.employmentStatus === "Unemployed") {
                updatedFormData = {
                    ...updatedFormData,
                    occupation: '',
                    dateStarted: '',
                    monthlyIncome: ''
                };
            }
    
            // Now update state and wait for it
            setFormData(updatedFormData);

            // Use the updated formData for API request
            await axios.put(`${API_URL}/${updatedFormData.id}`, updatedFormData);
            
            toast.success('Resident updated successfully!');
            fetchResidents();
            closeModal();
        } catch (error) {
            toast.error('Error updating resident!');
        }
    };

    //Delete resident
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null); // Store selected resident

    const openDeleteModal = (resident) => {
        setSelectedResident(resident); // Store resident data
        setIsDeleteModalOpen(true); // Open modal
    };

    const [fetchedHouseholdData, setFetchedHouseholdData] = useState([]);
    const [residentsInHousehold, setresidentsInHousehold] = useState([]);

    //Fetchiing household data
    const fetchHouseholdData = async () => {
        try {
        const response = await axios.get("http://localhost:5000/api/household");
        const sortedResidents = response.data.sort((a, b) => b.id - a.id); // Sort by id in descending order (asc a.id - b.id)
        setFetchedHouseholdData(response.data);
        } catch (error) {
        console.error("Error fetching household data:", error);
        }
    };
    
    useEffect(() => {
        fetchHouseholdData(); // Fetch data on component mount
    }, []);

    useEffect(() => {
        const residentIds = fetchedHouseholdData.flatMap(household => 
            household.members.map(member => member.residentID)
        );
        setresidentsInHousehold(residentIds);
    }, [fetchedHouseholdData]);

    const handleDelete = async () => {
        if (!selectedResident) return; // Ensure resident is selected

        console.log(residentsInHousehold);
        console.log(selectedResident.id);
        console.log(residentsInHousehold.includes(selectedResident.id));

        // Check if the selected resident belongs to a household
        if (residentsInHousehold.includes(selectedResident.id)) {
            toast.error("Resident belongs to a household!");
            return; // Stop the function from proceeding further
        }

        try {
            await axios.delete(`${API_URL}/${selectedResident.id}`);
            toast.success('Resident deleted!');
            fetchResidents();
        } catch (error) {
            toast.error('Error deleting resident!');
        }
        setIsDeleteModalOpen(false); // Close modal
    };
    

    // Open modal with a specific mode
    const openModal = (selectedMode, residentData = null) => {
        setMode(selectedMode);
        setCurrentPage(1); // Reset to first page
        setIsModalOpen(true);
        if (residentData) {
            setFormData(residentData); // Assuming `setFormData` is a state setter function
        }
    };

    // Close modal and reset
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPage(1);
        setFormData({ firstname: '', middlename: '', lastname: '', suffix: '', sex: '', birthdate: '', maritalStatus: '', nationality: 'Filipino', religion: '', houseNumber: '', purok: '', barangay: 'Tambacan', mobileNumber: '', email: '', isStudent: '', schoolLevel: '', grade: '', school: '', employmentStatus: '', occupation: '', dateStarted: '', monthlyIncome: '', is4Ps: '', isSeniorCitizen: '', isPhilhealthMember: '' });
        setAge("");
        setmonthsEmployed("");
    };


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

    // Function to calculate if user is senior cetizen
    const calculateSeniorCetizen = (date) => {
        const age = calculateAge(date); // Ensure age is calculated first
        return age >= 60 ? "yes" : "no"; // Keep it lowercase for consistency
    };

    // Handle birthdate change
    const handleBirthdateChange = (e) => {
        const selectedDate = e.target.value;
        setFormData({ 
            ...formData, 
            birthdate: selectedDate, 
            isSeniorCitizen: calculateSeniorCetizen(selectedDate)
        });
        setAge(calculateAge(selectedDate));

    };

    // Function to calculate months employed
    const calculateMonthsEmployed = (date) => {
        if (!date) return ''; // Return empty if no date is selected

        const startDate = new Date(date);
        const today = new Date();

        let months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());

        return months < 0 ? 0 : months; // Prevent negative values
    };

    // Handle date change
    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setFormData({ 
            ...formData, 
            dateStarted: selectedDate, 
        });
        setmonthsEmployed(calculateMonthsEmployed(selectedDate));
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
    const [filteredResidents, setFilteredResidents] = useState([]);

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
        const filtered = residents.filter(resident => {
            const searchValue = searchTerm.toLowerCase();
            if (inputValueSearchBy === "firstname") {
                return resident.firstname.toLowerCase().includes(searchValue);
            } else if (inputValueSearchBy === "lastname") {
                return resident.lastname.toLowerCase().includes(searchValue);
            } else if (inputValueSearchBy === "sex") {
                return resident.sex.toLowerCase() === searchValue.toLowerCase();
            } else if (inputValueSearchBy === "age") {
                const residentAge = calculateAge(resident.birthdate);
                return isAgeInRange(searchTerm, residentAge);
            } else if (inputValueSearchBy === "maritalStatus") {
                return resident.maritalStatus.toLowerCase().includes(searchValue);
            } else if (inputValueSearchBy === "religion") {
                return resident.religion.toLowerCase().includes(searchValue);
            } else if (inputValueSearchBy === "purok") {
                return resident.purok.toLowerCase().includes(searchValue);
            }
            return false;
        });
        setFilteredResidents(filtered);
        setResidentsTable(filtered);
        }
    };


    //Upload CSV
    const [addCSVModal, setAddCSVModal] = useState(false);

     //File Upload
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
          toast.error("Please select a CSV file.");
          return;
        }
    
        Papa.parse(file, {
          complete: async (result) => {
    
            const residents = result.data.map((row) => ({
                firstname: row[0]?.toString().trim() || "",
                middlename: row[1]?.toString().trim() || "",
                lastname: row[2]?.toString().trim() || "",
                suffix: row[3]?.toString().trim() || "",
                sex: row[4]?.toString().trim() || "",
                birthdate: row[5]?.toString().trim() || "",
                maritalStatus: row[6]?.toString().trim() || "",
                nationality: row[7]?.toString().trim() || "",
                religion: row[8]?.toString().trim() || "",
                houseNumber: row[9]?.toString().trim() || "",
                purok: row[10]?.toString().trim() || "",
                barangay: row[11]?.toString().trim() || "",
                mobileNumber: row[12]?.toString().trim() || "",
                email: row[13]?.toString().trim() || "",
                isStudent: row[14]?.toString().trim() || "false",
                schoolLevel: row[15]?.toString().trim() || "",
                grade: row[16]?.toString().trim() || "",
                school: row[17]?.toString().trim() || "",
                employmentStatus: row[18]?.toString().trim() || "",
                occupation: row[19]?.toString().trim() || "",
                dateStarted: row[20]?.toString().trim() || "",
                monthlyIncome: row[21]?.toString().trim() || "",
                is4Ps: row[22]?.toString().trim() || "no",
                isSeniorCitizen: row[23]?.toString().trim() || "no",
                isPhilhealthMember: row[24]?.toString().trim() || "no"
            }));
              
        
            try {
                const response = await fetch("http://localhost:5000/upload-csv", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ residents }),
                });
                const data = await response.json();
                if (response.ok) {
                  toast.success("CSV uploaded successfully!");
                  fetchResidents();
                  setAddCSVModal(false);
                } else if (response.status === 409 && Array.isArray(data.message) && data.message.length > 0) {
                  toast.success("CSV uploaded successfully!");
  
                  toast.warning(`Some residents were skipped:\n${data.message.join("\n")}`, {
                    autoClose: false, // Prevent auto-closing for better visibility
                    position: "top-right",
                  });
                  fetchResidents();
                  setAddCSVModal(false);
                }
              } catch (error) {
                console.error("Error uploading file:", error);
                toast.error("Error uploading file.");
              }
            },
            header: false,
            skipEmptyLines: true,
            dynamicTyping: false, // Ensures all data is treated as a string
          });
    };


    //Certification
    const [certificationModal, setcertificationModal] = useState(false);
    const printRef = useRef(); // Create a reference for printing


    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Barangay Certification - ${selectedResident?.name || "Unknown"}`,
    });

    return(
        <div className="residentscontainer">
            <div className="residentstoppart">
                <button type="button" class="btn btn-success" id="addresidentsbutton" onClick={() => openModal("add")}>Add Resident</button>
                <div className="residentstopright">
                <div class="input-group mb-3" id="searchresidentinput">
                    <div class="dropdown">
                        <button class="btn btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" onChange={handleSearchByInputChange}>
                            {`Search by ${inputValueSearchBy}`}
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("firstname");setTypeOfInput("text"); setResidentsTable(residents); setSearchTerm("")}} href="#">All</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("firstname");setTypeOfInput("text");}} href="#">Firstname</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("lastname");setTypeOfInput("text");}}href="#">Lastname</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("sex");setTypeOfInput("text");}}href="#">Sex</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("age");setTypeOfInput("text");}}href="#">Age</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("maritalStatus");setTypeOfInput("text");}}href="#">Marital Status</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("religion");setTypeOfInput("text");}}href="#">Religion</a></li>
                            <li><a class="dropdown-item" onClick={() => {setInputSearchBy("purok");setTypeOfInput("text");}}href="#">Purok</a></li>
                        </ul>
                    </div>
                    <input type={`${typeOfInput}`} placeholder={`Enter ${inputValueSearchBy}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} class="form-control" aria-label="Username" aria-describedby="basic-addon1"/>
                </div>
                <button type="button" class="btn btn-success" id="searchresidentsbutton" onClick={handleSearch}>Search</button>
                </div>

            </div>
            <div className="residentstable">
                <div className="table-container">
                <table class="table table-striped table-hover">
                    <thead class="table-success">
                        <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Firstname</th>
                        <th scope="col">Lastname</th>
                        <th scope="col">House Number</th>
                        <th scope="col">Purok</th>
                        <th scope="col"></th>
                        {/*<th scope="col"></th>*/}
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
                                    <p className="text-xl text-primary cursor-pointer" id="residentsviewmore" onClick={() => openModal("view", resident)}>View more</p>
                                </td>
                                {/*<td>
                                    <button type="button" class="btn btn-success" id="residenteditbutton" onClick={() => {setcertificationModal(true); setSelectedResident(resident)}}>Certification</button>
                                </td>*/}
                                <td>
                                    <button type="button" class="btn btn-success" id="residenteditbutton" onClick={() => openModal("edit", resident)}>Edit</button>
                                </td>
                                <td>
                                <button type="button" className="btn btn-danger" id="residentdeletebutton"  onClick={() => openDeleteModal(resident)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                <p className="resultstext">Results: ({residentsTable.length}) total rows</p>
            </div>

            {/* Add Resident Modal */}
            {isModalOpen && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {mode === "add" && "Add Resident"}
                                        {mode === "edit" && "Edit Resident"}
                                        {mode === "view" && "Resident Information"}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeModal}
                                        aria-label="Close"
                                    ></button>
                                </div>

                                {/* Modal Body - Page Content */}
                                <div className="modal-body">
                                    {currentPage === 1 && (
                                        <>
                                        {mode === "add" && (
                                        <div className="d-flex justify-content-end">
                                        <button className="btn btn-primary" id="addCSVbutton" type="button" onClick={() => {setAddCSVModal(true);setIsModalOpen(false);}}>Upload CSV File</button>
                                        </div>
                                        )}
                                        <p>Personal Information</p>
                                        <form>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Firstname</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={formData.firstname} onChange={handleChange} readOnly={mode === "view"}/>
                                            <span class="input-group-text" id="basic-addon1">Middlename</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" require name="middlename" value={formData.middlename} onChange={handleChange} readOnly={mode === "view"}/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Lastname</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="lastname" value={formData.lastname} onChange={handleChange} readOnly={mode === "view"}/>
                                            <span class="input-group-text" id="basic-addon1">Suffix</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" name="suffix" value={formData.suffix} onChange={handleChange} readOnly={mode === "view"}/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <button class="btn btn-outline-secondary dropdown-toggle" type="button"data-bs-toggle={mode !== "view" ? "dropdown" : undefined} aria-expanded="false">Sex</button>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="#" onClick={mode !== "view" ? () => handleSexChange("Female") : undefined}>Female</a></li>
                                                <li><a class="dropdown-item" href="#"onClick={mode !== "view" ? () => handleSexChange("Male") : undefined}>Male</a></li>
                                            </ul>
                                            <input type="text" class="form-control" value={formData.sex} aria-label="Text input with dropdown button" readOnly required/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Birthdate</span>
                                            <input type="date" class="form-control" aria-label="Username" aria-describedby="basic-addon1" value={formData.birthdate}  onChange={handleBirthdateChange}required readOnly={mode === "view"}/>
                                            <span class="input-group-text" id="basic-addon1">Age</span>
                                            <input type="number" class="form-control" aria-label="Username" aria-describedby="basic-addon1" readOnly value={calculateAge(formData.birthdate)}/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle={mode !== "view" ? "dropdown" : undefined} aria-expanded="false">Marital Status</button>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="#" onClick={() => handleMaritalStatusChange("Single")}>Single</a></li>
                                                <li><a class="dropdown-item" href="#" onClick={() => handleMaritalStatusChange("Married")}>Married</a></li>
                                                <li><a class="dropdown-item" href="#" onClick={() => handleMaritalStatusChange("Widowed")}>Widowed</a></li>
                                            </ul>
                                            <input type="text" class="form-control" value={formData.maritalStatus} aria-label="Text input with dropdown button" readOnly required/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Nationality</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required  name="nationality" defaultValue="Filipino" value={formData.nationality} onChange={handleChange} readOnly={mode === "view"}/>
                                            <span class="input-group-text" id="basic-addon1" >Religion</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="religion" value={formData.religion} onChange={handleChange} readOnly={mode === "view"}/>
                                        </div>
                                        </form>
                                        </>
                                    )}
                                    {currentPage === 2 && (
                                        <>
                                        <p>Address Information</p>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1" required>House Number / Street</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="houseNumber" value={formData.houseNumber} onChange={handleChange} readOnly={mode === "view"}/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1" required>Purok/Zone/Sitio</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="purok" value={formData.purok} onChange={handleChange} readOnly={mode === "view"}/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Barangay</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required readOnly value={formData.barangay}/>
                                        </div>
                                        <p>Contact Information</p>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1" required>Mobile Number</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" placeholder="(Optional)" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} readOnly={mode === "view"}/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1" required>Email Address</span>
                                            <input titleype="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" placeholder="(Optional)" name="email" value={formData.email} onChange={handleChange} readOnly={mode === "view"}/>
                                        </div>
                                        </>
                                    )}
                                    {currentPage === 3 && (
                                        <>
                                        <p>Education</p>
                                        <div class="input-group input-group-sm mb-3">
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="radio" name="studentStatus" checked={formData.isStudent === "true"}
                                                onChange={mode !== "view" ? () => handleStudentStatusChange("true") : undefined} aria-label="Radio button for following text input"/>
                                            </div>
                                            <input type="text" class="form-control" aria-label="Text input with radio button" value="Student" readOnly/>
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="radio" name="studentStatus" checked={formData.isStudent === "false"}onChange={mode !== "view" ? () => handleStudentStatusChange("false") : undefined} aria-label="Radio button for following text input"/>
                                            </div>
                                            <input type="text" class="form-control" aria-label="Text input with radio button" value="Not a Student" readOnly/>
                                        </div>
                                        {/* Show only if Student is selected */}
                                        {formData.isStudent === "true" && (
                                            <>
                                            {/* Education Level Dropdown */}
                                            <div className="input-group input-group-sm mb-3">
                                                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                {formData.schoolLevel || "Select Level"}
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><a class="dropdown-item" href="#" onClick={() => handleSchoolLevelChange("Elementary")}>Elementary</a></li>
                                                    <li><a class="dropdown-item" href="#"onClick={() => handleSchoolLevelChange("Highschool")}>Highschool</a></li>
                                                    <li><a class="dropdown-item" href="#"onClick={() => handleSchoolLevelChange("College")}>College</a></li>
                                                </ul>
                                                <input type="text" className="form-control" value={formData.schoolLevel} readOnly required />

                                                
                                                <span className="input-group-text">{formData.schoolLevel === "College" ? "Year" : "Grade"}</span>
                                                <input type="number" min="1" className="form-control" required name="grade" value={formData.grade} onChange={handleChange} readOnly={mode === "view"}/>
                                                
                                            </div>
                                            <div className="input-group input-group-sm mb-3">
                                                <span className="input-group-text" id="basic-addon1">
                                                School </span>
                                                <input type="text" className="form-control" aria-label="School" aria-describedby="basic-addon1"
                                                required name="school" value={formData.school} onChange={handleChange} readOnly={mode === "view"}/>
                                            </div>
                                            </>
                                        )}
                                        <p>Socio-Economic Information</p>
                                        <div class="input-group input-group-sm mb-3">
                                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle={mode !== "view" ? "dropdown" : undefined} aria-expanded="false">Employment Status</button>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="#" onClick={() => handleEmploymentStatusChange("Employed")}>Employed</a></li>
                                                <li><a class="dropdown-item" href="#"onClick={() => handleEmploymentStatusChange("Unemployed")}>Unemployed</a></li>
                                            </ul>
                                            <input type="text" class="form-control" value={formData.employmentStatus}  aria-label="Text input with dropdown button" readOnly required/>
                                        </div>
                                        {/* Show only if employed*/}
                                        {(formData.employmentStatus === "Employed") && (
                                            <>
                                            {/* Occupation */}
                                            <div className="input-group input-group-sm mb-3">
                                                <span className="input-group-text" id="basic-addon1">
                                                Occupation </span>
                                                <input type="text" className="form-control" aria-label="Occupation" aria-describedby="basic-addon1"
                                                required name="occupation" value={formData.occupation} onChange={handleChange} readOnly={mode === "view"}/>
                                            </div>

                                            {/* Date Started & Months Employed */}
                                            <div className="input-group input-group-sm mb-3">
                                                <span className="input-group-text" id="basic-addon1">
                                                Date Started</span>
                                                <input type="date" className="form-control" value={formData.dateStarted} onChange={handleDateChange} required readOnly={mode === "view"}/>
                                                <span className="input-group-text" id="basic-addon1">
                                                Months Employed</span>
                                                <input type="text" className="form-control" value={calculateMonthsEmployed(formData.dateStarted)} readOnly/>
                                            </div>

                                            {/* Monthly Income (Formatted as PHP Currency) */}
                                            <div className="input-group input-group-sm mb-3">
                                                <span className="input-group-text" id="basic-addon1">
                                                Monthly Income (₱)</span>
                                                <input type="number" min="0" className="form-control" placeholder="(Optional)" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} readOnly={mode === "view"}/>
                                                <span className="input-group-text" id="basic-addon1">
                                                .00</span>
                                            </div>
                                            </>
                                        )}
                                        </>
                                    )}
                                    {currentPage === 4 && (
                                        <>
                                        <p>Government & Special Status</p>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">4Ps Beneficiary?</span>
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="radio" value="yes" aria-label="Radio button for following text input" name='4psbeneficiary' checked={formData.is4Ps === "yes"} onChange={mode !== "view" ? handle4PsChange : undefined}disabled={mode === "view"}/>
                                            </div>
                                            <input type="text" class="form-control" aria-label="Text input with radio button" value="yes" readOnly/>
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="radio" value="no" aria-label="Radio button for following text input" name='4psbeneficiary' checked={formData.is4Ps === "no"}onChange={mode !== "view" ? handle4PsChange : undefined}disabled={mode === "view"}/>
                                            </div>
                                            <input type="text" class="form-control" aria-label="Text input with radio button" value="no" readOnly/>
                                        </div>
                                        <div className="input-group input-group-sm mb-3">
                                            <span className="input-group-text" id="basic-addon1">Senior Citizen?</span>
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="radio" value="yes" aria-label="Radio button for following text input" name='seniorcitizen' checked={formData.isSeniorCitizen === "yes"} disabled/>
                                            </div>
                                            <input type="text" class="form-control" aria-label="Text input with radio button" value="yes" readOnly/>
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="radio" value="no" aria-label="Radio button for following text input" name='seniorcitizen' checked={formData.isSeniorCitizen === "no"} disabled/>
                                            </div>
                                            <input type="text" class="form-control" aria-label="Text input with radio button" value="no" readOnly/>
                                        </div>
                                        <div className="input-group input-group-sm mb-3">
                                            <span className="input-group-text" id="basic-addon1">PhilHealth Member?</span>
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="radio" value="yes" aria-label="Radio button for following text input" name='philhealth' checked={formData.isPhilhealthMember === "yes"} onChange={mode !== "view" ?handlePhilhealthMemberChange : undefined}disabled={mode === "view"}/>
                                            </div>
                                            <input type="text" class="form-control" aria-label="Text input with radio button" value="yes" readOnly/>
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="radio" value="no" aria-label="Radio button for following text input" name='philhealth' checked={formData.isPhilhealthMember === "no"} onChange={mode !== "view" ?handlePhilhealthMemberChange : undefined}disabled={mode === "view"}/>
                                            </div>
                                            <input type="text" class="form-control" aria-label="Text input with radio button" value="no" readOnly/>
                                        </div>
                                        </>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="modal-footer">
                                    <span className="me-auto">Page {currentPage}/{totalPages}</span>

                                    {/* Back Button (Hidden on first page) */}
                                    {currentPage > 1 && (
                                        <button className="btn btn-secondary" onClick={() => setCurrentPage(currentPage - 1)}>
                                            Back
                                        </button>
                                    )}

                                    {/* Next Button (Hidden on last page) */}
                                    {currentPage < totalPages ? (
                                        <button className="btn btn-primary" onClick={() => {
                                            if (validatePage()) setCurrentPage(currentPage + 1);
                                        }}>
                                            Next
                                        </button>
                                    ) : (
                                        // Last Page Buttons
                                        <>
                                            {mode === "view" ? (
                                                <button className="btn btn-secondary" onClick={closeModal}>
                                                    Close
                                                </button>
                                            ) : (
                                                <button className="btn btn-success" onClick={(e) => {
                                                    if (validatePage()) {
                                                        if (mode === "add") {
                                                            handleAddResident(e);
                                                        } else {
                                                            handleEditResident(e);
                                                        }
                                                        closeModal();
                                                    }
                                                }}>
                                                    {mode === "add" ? "Add" : "Save"}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/*Modal for are you sure to delete resident */}
            {isDeleteModalOpen && (
            <>
                <div className="modal-backdrop fade show"></div>
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" 
                                    onClick={() => setIsDeleteModalOpen(false)} 
                                    className="btn-close" 
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <h5 className="modal-title">
                                    Are you sure you want to delete {selectedResident?.firstname} {selectedResident?.lastname}?
                                </h5>
                            </div>
                            <div className="modal-footer d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary"  
                                    onClick={() => setIsDeleteModalOpen(false)}>
                                    Close
                                </button>
                                <button type="button" onClick={handleDelete} 
                                    className="btn btn-primary">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            )}
            {/* UPLOAD CSV MODAL */}
            {addCSVModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Upload CSV File</h5>
                                    <button type="button" className="btn-close" onClick={() => {setAddCSVModal(false); openModal("add")}}></button>
                                </div>
                                <div className="modal-body">
                                    <div class="input-group mb-3">
                                        <input type="file" accept=".csv" onChange={handleFileChange} class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm"/>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={handleUpload}>Upload</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div> {/* Background overlay */}
                </>
            )}


            {/* Certification MODAL */}
            {certificationModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Certification</h5>
                                    <button type="button" className="btn-close" onClick={() => {setcertificationModal(false); }}></button>
                                </div>
                                <div className="modal-body">
                                    {selectedResident && <Certification ref={printRef} resident={selectedResident} />}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={handlePrint}>Print Certification</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div> {/* Background overlay */}
                </>
            )}
        <ToastContainer />
        </div>
    );
}

export default Residents;