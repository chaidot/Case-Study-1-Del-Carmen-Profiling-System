import "./household.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Card from "./Card";
import axios from 'axios';
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/residents';

function Households(){
    const [residents, setResidents] = useState([]);

    // Fetch all ressidents
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

    //Add Household
    const [openAddHouseholdModal, setopenAddHouseholdModal] = useState(false);
    const [openresidenttable, setopenresidenttable] = useState(false);
    const [memberAdded, setmemberAdded] = useState("");

    const [searchData, setSearchData] = useState({ firstname: '', middlename: '' });

    const [residentID, setResidentID] = useState("");
    const [isAddEnabled, setIsAddEnabled] = useState(false);

    // Handle search change
    const handleChange = (e) => {
        setSearchData({ ...searchData, [e.target.name]: e.target.value });
    };

    // Find resident function
    const findResident = () => {
        const foundResident = residents.find(
            (resident) =>
                resident.firstname.toLowerCase() === searchData.firstname.toLowerCase() &&
                resident.lastname.toLowerCase() === searchData.lastname.toLowerCase()
        );
    
        if (foundResident) {
            setResidentID(foundResident.id);
            setMemberFormData((prevData) => ({
                ...prevData,
                residentID: foundResident.id, // Correctly updating residentID
            }));
            setIsAddEnabled(true);
            toast.success("Resident Found!");
        } else {
            toast.error("Resident not found");
            setResidentID(""); // Clear ID field if not found
            setIsAddEnabled(false); // Disable button if not found
        }
    };

    const [memberFormData, setMemberFormData] = useState({ isHead: '', relationship: '', residentID: '' });
    const [householdData, setHouseholdData] = useState([]);
    const [fetchedHouseholdData, setFetchedHouseholdData] = useState([]);
    const [filteredHouseholds, setFilteredHouseholds] = useState([]);

    const [mode, setMode] = useState('');

    // Handle memberForm change
    const handleMemberFormChange = (e) => {
        setMemberFormData({ ...memberFormData, relationship: e });
    };

    // Handle Add button click
    const handleAddMember = () => {
        const { relationship, residentID } = memberFormData;

        // Validation: Ensure relationship and residentID are not empty
        if(memberAdded === "Member"){
            if (!relationship || !residentID) {
                toast.error("Please fill in all fields.");
                return;
            }
        }

        // Update memberFormData
        const newMember = {
        isHead: memberAdded === "Head" ? "true" : "false",
        relationship: memberAdded === "Head" ? "head" : relationship,
        residentID,
        };

        // Add new member to householdData
        setHouseholdData([...householdData, newMember]);

        // Reset states
        setSearchData({ firstname: "", lastname: "" });
        setMemberFormData({ isHead: "", relationship: "", residentID: "" });
        setResidentID("");
        setIsAddEnabled(false);

        toast.success("Member added successfully!");

        setopenresidenttable(false);
    };

    // Find the head
    const head = householdData.find(member => member.isHead === "true");
    const headResident = head ? residents.find(resident => resident.id === head.residentID) : null;

    // Find members (excluding head)
    const members = householdData.filter(member => member.isHead === "false");
    const memberResidents = members.map(member => residents.find(resident => resident.id === member.residentID));

    // Function to remove a specific member
    const removeMember = (residentID) => {
        setHouseholdData(prevData => prevData.filter(member => member.residentID !== residentID));
    };

    // Function to remove the head (clear householdData)
    const removeHead = () => {
        setHouseholdData([]); // Clears the entire household
    };

    
    //Fetchiing household data
    const fetchHouseholdData = async () => {
        try {
        const response = await axios.get("http://localhost:5000/api/household");
        const sortedResidents = response.data.sort((a, b) => b.id - a.id); // Sort by id in descending order (asc a.id - b.id)
        setFetchedHouseholdData(response.data);
        setFilteredHouseholds(response.data);
        } catch (error) {
        console.error("Error fetching household data:", error);
        }
    };
    
    useEffect(() => {
        fetchHouseholdData(); // Fetch data on component mount
    }, []);


    const handleAddHousehold = async () => {
        if (householdData.length === 0) {
          toast.error("No members to add!");
          return;
        }
    
        try {
          const response = await axios.post("http://localhost:5000/api/household", {
            householdData,
          });
    
          if (response.status === 200) {
            toast.success("Household data saved successfully!");
            setHouseholdData([]); // Clear the data after saving;   
            setopenAddHouseholdModal(false);
          }
        } catch (error) {
          toast.error("Error saving household data!")
          console.error("Error saving household data:", error);
        }
        fetchHouseholdData(); 
        console.log("Household ADD",householdData)
    };

    const [householdID, setHouseholdID] = useState("");

    const handleEditHousehold = async () => {
        console.log("Household Data Before Sending:", householdData);
    
        if (!householdID) {
            toast.error("Household ID is missing!");
            return;
        }
    
        if (!householdData || !Array.isArray(householdData)) {
            toast.error("Invalid household members data!");
            return;
        }
    
        try {
            const response = await axios.put(`http://localhost:5000/api/household/${householdID}`, {
                members: householdData,
            });
    
            if (response.status === 200) {
                toast.success("Household data updated successfully!");
                fetchHouseholdData(); // Refresh UI
                setopenAddHouseholdModal(false);
            }
        } catch (error) {
            console.error("Error updating household:", error);
            toast.error("Error updating household data!");
        }
    }; 


    //Delete household
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState(''); 

    const openDeleteModal = (household) => {
        const headMember = household.find(member => member.isHead === "true");
        const headResident = headMember ? residents.find(resident => resident.id === headMember.residentID) : null;
    
        setHouseholdData(household);
        setSelectedHousehold(`${headResident.firstname} ${headResident.lastname}`); // Once updated, modal will open via useEffect
    };

    useEffect(() => {
        if (selectedHousehold) {
            setIsDeleteModalOpen(true);
        }
    }, [selectedHousehold]); 

    const handleDeleteHousehold = async (householdId) => {
        if (!householdId) {
            toast.error("Invalid household ID!");
            return;
        }
    
        try {
            const response = await axios.delete(`http://localhost:5000/api/household/${householdId}`);
    
            if (response.status === 200) {
                toast.success("Household deleted successfully!");
                setFetchedHouseholdData(prevData => prevData.filter(household => household.id !== householdId));
            }
        } catch (error) {
            toast.error("Error deleting household!");
            console.error("Error deleting household:", error);
        }
        fetchHouseholdData(); 
    }; 
    
    //Search in household
    const [searchQuery, setSearchQuery] = useState("");
    

    const handleSearch = () => {
        const filtered = fetchedHouseholdData.filter(household => {
            const headMember = household.members.find(member => member.isHead === "true");
            const resident = headMember 
                ? residents.find(res => res.id === headMember.residentID) 
                : null;
    
            return resident && resident.lastname.toLowerCase().includes(searchQuery.toLowerCase());
        });
    
        setFilteredHouseholds(filtered);
    };    

    //View more for each member
    const [viewMoreMemberInfo, setViewMoreMemberInfo] = useState(false);
    const [memberViewed, setMemberViewed] = useState(null); 

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 4;

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
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

    // Function to calculate months employed
    const calculateMonthsEmployed = (date) => {
        if (!date) return ''; // Return empty if no date is selected

        const startDate = new Date(date);
        const today = new Date();

        let months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());

        return months < 0 ? 0 : months; // Prevent negative values
    };
        

    //CARD CONTENTSS
    // Total number of households
    const totalHouseholds = filteredHouseholds.length;

    // Total household members
    const totalMembers = filteredHouseholds.reduce((sum, household) => sum + household.members.length, 0);

    // Average household members
    const avgHouseholdMembers = totalHouseholds > 0 ? Math.round(totalMembers / totalHouseholds) : 0;

    // Count employed and unemployed household heads
    const { employedHouseholdHead, unemployedHouseholdHead } = fetchedHouseholdData.reduce((lists, household) => {
        const headMember = household.members.find(member => member.isHead === "true");
        const headResident = headMember ? residents.find(resident => resident.id === headMember.residentID) : null;
    
        if (headResident) {
            if (headResident.employmentStatus === "Employed") {
                lists.employedHouseholdHead.push(household);
            } else if (headResident.employmentStatus === "Unemployed") {
                lists.unemployedHouseholdHead.push(household);
            }
        }
        return lists;
    }, { employedHouseholdHead: [], unemployedHouseholdHead: [] });
    
    const [viewHouseholds, setViewHouseholds] = useState("All");

    return(
        <div className="householdscontainer">
           <div className="socioeconomiccard">
                <div>
                    <Card className="h-100">
                        <h5 className="text-lg font-bold csscardtitle">Average Household Size:</h5>
                        <p className="text-xl" id="socioeconomictotaltext">{avgHouseholdMembers}</p>
                    </Card>
                </div>
                <div>
                    <Card className="h-100">
                        <h5 className="text-lg font-bold csscardtitle">Employed Household Head:</h5>
                        <p className="text-xl" id="socioeconomictotaltext">{employedHouseholdHead.length}</p>
                        <p className="text-xl" id="socioeconomicviewmore" onClick={() => {setFilteredHouseholds(employedHouseholdHead); setViewHouseholds("Employed")}}>View More</p>
                    </Card>
                </div>
                <div>
                    <Card className="h-100">
                        <h5 className="text-lg font-bold csscardtitle">Unemployed Household Head:</h5>
                        <p className="text-xl" id="socioeconomictotaltext">{unemployedHouseholdHead.length}</p>
                        <p className="text-xl" id="socioeconomicviewmore" onClick={() => {setFilteredHouseholds(unemployedHouseholdHead); setViewHouseholds("Unemployed")}}>View More</p>
                    </Card>
                </div>
            </div>

            <div className="householdstoppart">
                <button type="button" class="btn btn-success" id="addhouseholdsbutton" onClick={() => {setopenAddHouseholdModal(true); setMode('Add'); setHouseholdData([])}}>Add Household</button>
                <div className="householdstopright">
                    <div class="input-group mb-3" id="searchresidentinput">
                        <input type="text" class="form-control" placeholder="Enter lastname" aria-label="Username" aria-describedby="basic-addon1" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                    </div>
                    <button type="button" class="btn btn-success" id="searchhouseholdsbutton" onClick={handleSearch}>Search</button>
                    <button type="button" class="btn btn-success" id="allhouseholdsbutton"onClick={() => {setFilteredHouseholds(fetchedHouseholdData); setViewHouseholds("All")}}>All</button>
                </div>
            </div>
            <div className="householdstable">
                <div className="table-container">
                <table className="table table-striped table-hover">
                    <thead className="table-success">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Lastname</th>
                            <th scope="col">Firstname</th>
                            <th scope="col">Household Size</th>
                            <th scope="col"></th>
                            <th scope="col"></th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHouseholds.map((household) => {
                            // Find the household head
                            const headMember = household.members.find(member => member.isHead === "true");

                            // Find the resident information for the head member
                            const resident = headMember 
                                ? residents.find(res => res.id === headMember.residentID) 
                                : null;

                            return (
                                <tr key={household.id}>
                                    <td>{household.id}</td>
                                    <td>{resident ? resident.lastname : "N/A"}</td>
                                    <td>{resident ? resident.firstname : "N/A"}</td>
                                    <td>{household.members.length }</td>
                                    <td>
                                        <p className="text-xl text-primary cursor-pointer" id="householdsviewmore" onClick={() => {setopenAddHouseholdModal(true); setMode('View'); setHouseholdData(household.members)}}>
                                            View more
                                        </p>
                                    </td>
                                    <td>
                                        <button type="button" className="btn btn-success" id="householdeditbutton" onClick={() => {setopenAddHouseholdModal(true); setMode('Edit'); setHouseholdData(household.members); setHouseholdID(household.id); console.log("Household.id", household.id)}}>
                                            Edit
                                        </button>
                                    </td>
                                    <td>
                                        <button type="button" className="btn btn-danger" id="householddeletebutton"onClick={() => {openDeleteModal(household.members); setHouseholdID(household.id);}}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
                <div className="results"> 
                    <p className="resultstext">Results: ({filteredHouseholds.length}) total rows</p>
                    <p>{viewHouseholds}</p>
                </div>
            </div>
            {/*ADD HOUSEHOLD MODAL */}
            {openAddHouseholdModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    {mode === "Add" && (
                                        <h5 className="modal-title">Add Household</h5>
                                    )}
                                    {mode === "View" && (
                                        <h5 className="modal-title">Household Information</h5>
                                    )}
                                    {mode === "Edit" && (
                                        <h5 className="modal-title">Edit Household</h5>
                                    )}
                                    <button type="button" className="btn-close" onClick={() => {setopenAddHouseholdModal(false); {removeHead()};}}></button>
                                </div>
                                <div className="modal-body">
                                    {(mode === "Add" || mode === "Edit") && (
                                        !headResident ? (
                                            <p className="addhouseholdheadbutton" onClick={() => {setopenresidenttable(true); setmemberAdded("Head")}}>
                                                + Add Household Head
                                            </p>
                                        ) : (
                                            <p className="addhouseholdheadbutton" onClick={() => {setopenresidenttable(true); setmemberAdded("Member")}}>
                                                + Add Household Member
                                            </p>
                                        )
                                    )}
                                    <div>
                                        {/* Display Head Section if there is a Head */}
                                        {headResident && (
                                            <>
                                                <p className="subheading">Head</p>
                                                <div>
                                                    <div className="buttons">
                                                    <div>
                                                    {headResident.firstname} {headResident.middlename} {headResident.lastname} {headResident.suffix}
                                                    </div>
                                                    <div>
                                                    {/* {(mode === "Add" || mode === "Edit") && ( */}
                                                    {(mode === "Add") && (
                                                        <button className="removebutton" onClick={removeHead}>Remove</button>
                                                    )}
                                                    <button className="viewmorebutton" onClick={() => {setMemberViewed(headResident); setViewMoreMemberInfo(true)}}>View More</button>
                                                    </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Display Members Section if there are Members */}
                                        {memberResidents.length > 0 && (
                                            <>
                                                <p className="subheading">Members</p>
                                                {members.map((member, index) => {
                                                    const resident = residents.find(resident => resident.id === member.residentID);
                                                    return resident ? (
                                                        <div key={index}>
                                                            <div className="buttons">
                                                            <div>
                                                            ({member.relationship}) {resident.firstname} {resident.middlename} {resident.lastname} {resident.suffix}
                                                            </div>
                                                            <div>
                                                            {(mode === "Add" || mode === "Edit") && (
                                                                <button className="removebutton" onClick={() => removeMember(resident.id)}>
                                                                Remove
                                                            </button>
                                                            )}
                                                            <button className="viewmorebutton" onClick={() => {setMemberViewed(resident); setViewMoreMemberInfo(true)}}>View More</button>
                                                            </div>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    {mode === "Add" && (
                                        <button type="button" className="btn btn-primary" onClick={handleAddHousehold}>Add</button>
                                    )}
                                    {mode === "View" && (
                                        <button type="button" className="btn btn-secondary" onClick={() => {setopenAddHouseholdModal(false); {removeHead()};}}>Close</button>
                                    )}
                                    {mode === "Edit" && (
                                        <button type="button" className="btn btn-success"  onClick={handleEditHousehold}>Save</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div> {/* Background overlay */}
                </>
            )}
            {/*ADD Membertable MODAL */}
            {openresidenttable && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Choose a Resident</h5>
                                    <button type="button" className="btn-close" onClick={() => setopenresidenttable(false)}></button>
                                </div>
                                <div className="modal-body">
                                        {memberAdded === "Member" && (
                                            <>
                                            <div class="input-group mb-3">
                                                <div class="dropdown">
                                                    <button class="btn btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        Relationship to the Head
                                                    </button>
                                                    <ul class="dropdown-menu">
                                                        <li><a class="dropdown-item" href="#"onClick={() => handleMemberFormChange("Spouse")}>Spouse</a></li>
                                                        <li><a class="dropdown-item" href="#"onClick={() => handleMemberFormChange("Son/Daughter")}>Son/Daughter</a></li>
                                                        <li><a class="dropdown-item" href="#" onClick={() => handleMemberFormChange("Parent")}>Parent</a></li>
                                                        <li><a class="dropdown-item" href="#" onClick={() => handleMemberFormChange("Sibling")}>Sibling</a></li>
                                                        <li><a class="dropdown-item" href="#"onClick={() => handleMemberFormChange("Grandparent")}>Grandparent</a></li>
                                                        <li><a class="dropdown-item" href="#" onClick={() => handleMemberFormChange("Grandchild")}>Grandchild</a></li>
                                                        <li><a class="dropdown-item" href="#" onClick={() => handleMemberFormChange("Uncle/Aunt")}>Uncle/Aunt</a></li>
                                                        <li><a class="dropdown-item" href="#" onClick={() => handleMemberFormChange("Nephew/Niece")}>Nephew/Niece</a></li>
                                                        <li><a class="dropdown-item" href="#" onClick={() => handleMemberFormChange("Cousin")}>Cousin</a></li>
                                                    </ul>
                                                </div>
                                                <input type="text" class="form-control"placeholder="" aria-label="Username" aria-describedby="basic-addon1" readOnly value={memberFormData.relationship} required/>
                                            </div>
                                            </>
                                        )}
                                        <div class="input-group mb-3">
                                            <span class="input-group-text" id="basic-addon1">Resident ID</span>
                                            <input type="text" class="form-control" placeholder="Auto-filled after finding resident" aria-label="Username" aria-describedby="basic-addon1" name="residentID" value={memberFormData.residentID} readOnly required/>
                                        </div>
                                        <div class="input-group mb-3">
                                        <span className="input-group-text" id="basic-addon1">Firstname</span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="firstname"
                                            value={searchData.firstname}
                                            onChange={handleChange}
                                        />

                                        <span className="input-group-text" id="basic-addon1">Lastname</span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastname"
                                            value={searchData.lastname}
                                            onChange={handleChange}
                                        />
                                        </div>
                                        <p className="addhouseholdheadbutton" id="findresident" onClick={findResident}>Find Resident</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={handleAddMember} disabled={!isAddEnabled}>Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div> {/* Background overlay */}
                </>
            )}

            {/*Modal for are you sure to delete household */}
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
                                    Are you sure you want to delete the household of {selectedHousehold}?
                                </h5>
                            </div>
                            <div className="modal-footer d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary"  
                                    onClick={() => setIsDeleteModalOpen(false)}>
                                    Close
                                </button>
                                <button type="button" onClick={() => {handleDeleteHousehold(householdID); setIsDeleteModalOpen(false)}} 
                                    className="btn btn-primary">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            )}

            {viewMoreMemberInfo && (
            <>
                <div className="modal-backdrop fade show"></div>
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Resident Information</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => {setViewMoreMemberInfo(false); setCurrentPage(1)}}></button>
                            </div>
                            <div className="modal-body">
                                {currentPage === 1 && 
                                    <>
                                    <p>Personal Information</p>
                                    <form>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Firstname</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.firstname} readOnly/>
                                            <span class="input-group-text" id="basic-addon1">Middlename</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" require name="middlename" value={memberViewed.middlename} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Lastname</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.lastname} readOnly/>
                                            <span class="input-group-text" id="basic-addon1">Suffix</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" require name="middlename" value={memberViewed.suffix} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Sex</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.sex} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Birthdate</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.birthdate} readOnly/>
                                            <span class="input-group-text" id="basic-addon1">Age</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" require name="middlename" value={calculateAge(memberViewed.birthdate)} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Marital Status</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.maritalStatus} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Nationality</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.nationality} readOnly/>
                                            <span class="input-group-text" id="basic-addon1">Religion</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" require name="middlename" value={memberViewed.religion} readOnly/>
                                        </div>
                                    </form>
                                    </>
                                }
                                {currentPage === 2 && 
                                    <>
                                    <p>Address Information</p>
                                    <form>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">House Number / Street</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.houseNumber} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Purok/Zone/Sitio</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.purok} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Barangay</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.barangay} readOnly/>
                                        </div>
                                    </form>
                                    <p>Contact Information</p>
                                    <form>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Mobile Number
                                            </span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={'0' + memberViewed.mobileNumber} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Email Address</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.email} readOnly/>
                                        </div>
                                    </form>
                                    </>
                                }
                                {currentPage === 3 && 
                                    <>
                                    <p>Education</p>
                                    {memberViewed.isStudent === "true" && (
                                        <>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">School Level</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.schoolLevel} readOnly/>
                                            <span class="input-group-text" id="basic-addon1">Grade/Year</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" require name="middlename" value={memberViewed.grade} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">School</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.school} readOnly/>
                                        </div>
                                        </>
                                    )}
                                    {memberViewed.isStudent === "false" && (
                                        <>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Student</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={'Not a Student'} readOnly/>
                                        </div>
                                        </>
                                    )}
                                    <p>Socio-Economic Information</p>
                                    <div class="input-group input-group-sm mb-3">
                                        <span class="input-group-text" id="basic-addon1">Employment Status</span>
                                        <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.employmentStatus} readOnly/>
                                    </div>
                                    {memberViewed.employmentStatus === "Employed" && (
                                        <>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Occupation</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.occupation} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Date Started</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.dateStarted} readOnly/>
                                            <span class="input-group-text" id="basic-addon1">Months Employed</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" require name="middlename" value={calculateMonthsEmployed(memberViewed.dateStarted)} readOnly/>
                                        </div>
                                        <div class="input-group input-group-sm mb-3">
                                            <span class="input-group-text" id="basic-addon1">Monthly Income</span>
                                            <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={"₱" +  memberViewed.monthlyIncome + ".00"} readOnly/>
                                        </div>
                                        </>
                                    )}
                                    </>
                                }
                                {currentPage === 4 && 
                                    <>
                                    <p>Government and Special Status</p>
                                    <div class="input-group input-group-sm mb-3">
                                        <span class="input-group-text" id="basic-addon1">4Ps Beneficiary?</span>
                                        <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.is4Ps} readOnly/>
                                    </div>
                                    <div class="input-group input-group-sm mb-3">
                                        <span class="input-group-text" id="basic-addon1">Senior Citizen?</span>
                                        <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.isSeniorCitizen} readOnly/>
                                    </div>
                                    <div class="input-group input-group-sm mb-3">
                                        <span class="input-group-text" id="basic-addon1">PhilHealth Member?</span>
                                        <input type="text" class="form-control" aria-label="Username" aria-describedby="basic-addon1" required name="firstname" value={memberViewed.isPhilhealthMember} readOnly/>
                                    </div>
                                    </>
                                }
                            </div>
                            <div className="modal-footer d-flex justify-content-between align-items-center">
                                <span>Page {currentPage} / {totalPages}</span>
                                <div>
                                    {currentPage > 1 && <button type="button" className="btn btn-secondary me-2" onClick={prevPage}>Back</button>}
                                    {currentPage < totalPages && <button type="button" className="btn btn-primary" onClick={nextPage}>Next</button>}
                                    {currentPage === totalPages && <button type="button" className="btn btn-danger" onClick={() => {setViewMoreMemberInfo(false); setCurrentPage(1)}}>Close</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            )}
        <ToastContainer />
        </div>


    );
}

export default Households;