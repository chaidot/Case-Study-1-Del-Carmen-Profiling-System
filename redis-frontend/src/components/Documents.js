import "./documents.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import Certification from './Certification';
import html2pdf from 'html2pdf.js';

const API_URL = 'http://localhost:5000/documents';

function Documents() {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('documentType');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const certificationRef = useRef(null);
    const [newDocument, setNewDocument] = useState({
        documentType: '',
        residentId: '',
        purpose: '',
        dateIssued: new Date().toISOString().split('T')[0],
        status: 'pending',
        amount: '',
        validUntil: '',
        requirements: '',
        notes: ''
    });

    // Fetch all documents
    const fetchDocuments = async () => {
        try {
            const response = await axios.get(API_URL); 
            setDocuments(response.data);
            setFilteredDocuments(response.data);
        } catch (error) {
            toast.error('Error fetching documents:', error);
        }
    };

    // Fetch resident data for certification
    const fetchResidentData = async (residentId) => {
        try {
            const response = await axios.get(`http://localhost:5000/residents/${residentId}`);
            setSelectedResident(response.data);
            return response.data;
        } catch (error) {
            toast.error('Error fetching resident data:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Handle document download
    const handleDownloadDocument = async (doc) => {
        if (doc.documentType === 'Certificate of Indigency') {
            try {
                const residentData = await fetchResidentData(doc.residentId);
                if (residentData) {
                    setSelectedResident(residentData);
                    // Wait for the next render cycle to ensure the certification is rendered
                    setTimeout(() => {
                        if (certificationRef.current) {
                            const element = certificationRef.current;
                            const opt = {
                                margin: 1,
                                filename: `certification_${doc.residentId}.pdf`,
                                image: { type: 'jpeg', quality: 0.98 },
                                html2canvas: { scale: 2 },
                                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                            };

                            html2pdf().set(opt).from(element).save();
                        } else {
                            toast.error('Could not find certification component. Please try again.');
                        }
                    }, 500); // Increased timeout to ensure component is rendered
                } else {
                    toast.error('Could not fetch resident data. Please try again.');
                }
            } catch (error) {
                toast.error('Error generating certification:', error);
            }
        } else {
            try {
                const response = await axios.get(`${API_URL}/${doc.id}/download`, {
                    responseType: 'blob'
                });
                
                // Create a blob from the response data
                const blob = new Blob([response.data], { type: 'application/pdf' });
                
                // Create a URL for the blob
                const url = window.URL.createObjectURL(blob);
                
                // Create a temporary link element
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${doc.documentType.toLowerCase().replace(/\s+/g, '_')}_${doc.id}.pdf`);
                
                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                link.remove();
                
                // Clean up the URL
                window.URL.revokeObjectURL(url);
                
                toast.success('Document downloaded successfully!');
            } catch (error) {
                toast.error('Error downloading document:', error);
            }
        }
    };

    // Handle search
    const handleSearch = () => {
        if (searchTerm.length > 0) {
            const filtered = documents.filter(doc => {
            const searchValue = searchTerm.toLowerCase();
                if (searchBy === 'documentType') {
                    return doc.documentType.toLowerCase().includes(searchValue);
                } else if (searchBy === 'status') {
                    return doc.status.toLowerCase().includes(searchValue);
            }
            return false;
        });
            setFilteredDocuments(filtered);
        } else {
            setFilteredDocuments(documents);
        }
    };

    // Handle document creation
    const handleCreateDocument = async () => {
        try {
            const response = await axios.post(API_URL, newDocument);
            if (response.status === 201) {
                toast.success('Document created successfully!');
                setShowCreateModal(false);
                setNewDocument({
                    documentType: '',
                    residentId: '',
                    purpose: '',
                    dateIssued: new Date().toISOString().split('T')[0],
                    status: 'pending',
                    amount: '',
                    validUntil: '',
                    requirements: '',
                    notes: ''
                });
                fetchDocuments();
            }
        } catch (error) {
            toast.error('Error creating document:', error);
        }
    };

    // Handle document deletion
    const handleDeleteDocument = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const response = await axios.delete(`${API_URL}/${id}`);
                if (response.status === 200) {
                    toast.success('Document deleted successfully!');
                    fetchDocuments();
                }
            } catch (error) {
                toast.error('Error deleting document:', error);
            }
        }
    };

    // Handle status change
    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, { status: newStatus });
            if (response.status === 200) {
                toast.success('Document status updated successfully!');
                fetchDocuments();
            }
        } catch (error) {
            toast.error('Error updating document status:', error);
        }
    };

    return (
        <div className="documentscontainer">
            <div className="documentstoppart">
                <button 
                    type="button" 
                    className="btn btn-success" 
                    id="adddocumentsbutton"
                    onClick={() => setShowCreateModal(true)}
                >
                    Request Document
                </button>
                
                <div className="input-group mb-3" id="searchdocumentinput">
                    <div className="dropdown">
                        <button 
                            className="btn btn dropdown-toggle" 
                            type="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false"
                        >
                            {`Search by ${searchBy}`}
                            </button>
                        <ul className="dropdown-menu">
                            <li>
                                <a 
                                    className="dropdown-item" 
                                    onClick={() => {
                                        setSearchBy('documentType');
                                        setSearchTerm('');
                                        setFilteredDocuments(documents);
                                    }} 
                                    href="#"
                                >
                                    Document Type
                                </a>
                            </li>
                            <li>
                                <a 
                                    className="dropdown-item" 
                                    onClick={() => {
                                        setSearchBy('status');
                                        setSearchTerm('');
                                        setFilteredDocuments(documents);
                                    }} 
                                    href="#"
                                >
                                    Status
                                </a>
                            </li>
                            </ul>
                    </div>
                    <input 
                        type="text" 
                        placeholder={`Enter ${searchBy}`} 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="form-control" 
                    />
                    <button 
                        type="button" 
                        className="btn btn-success" 
                        id="searchdocumentsbutton" 
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>
            </div>
            
                <div className="table-container">
                <table className="table table-striped table-hover">
                    <thead className="table-success">
                        <tr>
                        <th scope="col">ID</th>
                            <th scope="col">Document Type</th>
                            <th scope="col">Resident ID</th>
                            <th scope="col">Purpose</th>
                            <th scope="col">Date Issued</th>
                            <th scope="col">Valid Until</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocuments.map((doc) => (
                            <tr key={doc.id}>
                                <td>{doc.id}</td>
                                <td>{doc.documentType}</td>
                                <td>{doc.residentId}</td>
                                <td>{doc.purpose}</td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <small className="text-muted">Issued On:</small>
                                        {new Date(doc.dateIssued).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <small className="text-muted">Valid Until:</small>
                                        {doc.validUntil ? new Date(doc.validUntil).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </div>
                                </td>
                                <td>₱{doc.amount || '0.00'}</td>
                                <td>
                                    <select 
                                        className={`form-select form-select-sm bg-${doc.status === 'pending' ? 'warning' : 'success'} text-white`}
                                        value={doc.status}
                                        onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleDownloadDocument(doc)}
                                    >
                                        Download
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteDocument(doc.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

            {/* Reques Document Modal */}
            {showCreateModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Document</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowCreateModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Document Type</label>
                                        <select 
                                            className="form-select"
                                            value={newDocument.documentType}
                                            onChange={(e) => setNewDocument({...newDocument, documentType: e.target.value})}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Barangay Clearance">Barangay Clearance</option>
                                            <option value="Certificate of Residency">Certificate of Residency</option>
                                            <option value="Certificate of Indigency">Certificate of Indigency</option>
                                            <option value="Business Permit">Business Permit</option>
                                            <option value="Certificate of Good Moral">Certificate of Good Moral</option>
                                            <option value="Certificate of Employment">Certificate of Employment</option>
                                            <option value="Certificate of Live Birth">Certificate of Live Birth</option>
                                            <option value="Certificate of Death">Certificate of Death</option>
                                            <option value="Certificate of Marriage">Certificate of Marriage</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Resident ID</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={newDocument.residentId}
                                            onChange={(e) => setNewDocument({...newDocument, residentId: e.target.value})}
                                            placeholder="Enter Resident ID"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Purpose</label>
                                    <textarea 
                                        className="form-control"
                                        value={newDocument.purpose}
                                        onChange={(e) => setNewDocument({...newDocument, purpose: e.target.value})}
                                        placeholder="Enter purpose of the document"
                                        rows="2"
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date Issued</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-calendar"></i>
                                            </span>
                                            <input 
                                                type="date" 
                                                className="form-control"
                                                value={newDocument.dateIssued}
                                                onChange={(e) => setNewDocument({...newDocument, dateIssued: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Valid Until</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-calendar-check"></i>
                                            </span>
                                            <input 
                                                type="date" 
                                                className="form-control"
                                                value={newDocument.validUntil}
                                                onChange={(e) => setNewDocument({...newDocument, validUntil: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Amount (PHP)</label>
                                        <input 
                                            type="number" 
                                            className="form-control"
                                            value={newDocument.amount}
                                            onChange={(e) => setNewDocument({...newDocument, amount: e.target.value})}
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Status</label>
                                        <select 
                                            className="form-select"
                                            value={newDocument.status}
                                            onChange={(e) => setNewDocument({...newDocument, status: e.target.value})}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Requirements</label>
                                    <textarea 
                                        className="form-control"
                                        value={newDocument.requirements}
                                        onChange={(e) => setNewDocument({...newDocument, requirements: e.target.value})}
                                        placeholder="Enter required documents or requirements"
                                        rows="2"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Additional Notes</label>
                                    <textarea 
                                        className="form-control"
                                        value={newDocument.notes}
                                        onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                                        placeholder="Enter any additional notes or remarks"
                                        rows="2"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleCreateDocument}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
            </div>
            )}

            {/* Hidden certification component */}
            {selectedResident && (
                <div style={{ position: 'absolute', left: '-9999px' }}>
                    <div ref={certificationRef}>
                        <Certification resident={selectedResident} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Documents;