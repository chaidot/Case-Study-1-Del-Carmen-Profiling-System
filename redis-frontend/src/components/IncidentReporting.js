import React, { useState, useEffect } from 'react';
import './IncidentReporting.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const IncidentReporting = () => {
    const [incidents, setIncidents] = useState([]);
    const [formData, setFormData] = useState({
        type: 'blotter',
        title: '',
        description: '',
        location: '',
        reporterName: '',
        reporterContact: '',
        priority: 'low',
        status: 'pending'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/incidents');
            if (response.status === 200) {
                setIncidents(response.data);
            }
        } catch (error) {
            console.error('Error fetching incidents:', error);
            toast.error('Failed to fetch incidents');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:5000/incidents', formData);
            if (response.status === 201) {
                toast.success('Incident reported successfully!');
                setFormData({
                    type: '',
                    title: '',
                    description: '',
                    location: '',
                    reporterName: '',
                    reporterContact: '',
                    priority: 'low',
                    status: 'pending'
                });
                fetchIncidents();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to report incident');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await axios.put(`http://localhost:5000/incidents/${id}`, { status: newStatus });
            if (response.status === 200) {
                toast.success('Incident status updated successfully!');
                fetchIncidents();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update incident status');
        }
    };

    return (
        <div className="incident-reporting-container">
            <div className="incident-form-section">
                <h2>Report an Incident</h2>
                <form onSubmit={handleSubmit} className="incident-form">
                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="blotter">Barangay Blotter</option>
                            <option value="service">Public Service Request</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reporterName">Reporter Name</label>
                        <input
                            type="text"
                            id="reporterName"
                            value={formData.reporterName}
                            onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reporterContact">Contact Number</label>
                        <input
                            type="tel"
                            id="reporterContact"
                            value={formData.reporterContact}
                            onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>

            <div className="incidents-list-section">
                <h2>Recent Incidents</h2>
                <div className="incidents-list">
                    {incidents.map((incident) => (
                        <div key={incident.id} className={`incident-card ${incident.priority}`}>
                            <div className="incident-header">
                                <h3>{incident.title}</h3>
                                <span className={`status-badge ${incident.status}`}>
                                    {incident.status}
                                </span>
                            </div>
                            <p className="incident-type">{incident.type}</p>
                            <p className="incident-description">{incident.description}</p>
                            <div className="incident-details">
                                <p><strong>Location:</strong> {incident.location}</p>
                                <p><strong>Reporter:</strong> {incident.reporterName}</p>
                                <p><strong>Contact:</strong> {incident.reporterContact}</p>
                                <p><strong>Date:</strong> {new Date(incident.date).toLocaleString()}</p>
                            </div>
                            <div className="incident-actions">
                                <select
                                    value={incident.status}
                                    onChange={(e) => handleStatusUpdate(incident.id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IncidentReporting;