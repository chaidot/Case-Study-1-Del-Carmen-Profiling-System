import "./signin.css";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import iliganLogo from './images/iligan_logo.png';
import brgyLogo from './images/brgy-logo.jpg';

const API_URL = "http://localhost:5000/login";
const REGISTER_URL = "http://localhost:5000/register";

function Signin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const currentYear = new Date().getFullYear();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        // Validation for registration
        if (isRegistering && formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            toast.error("Passwords don't match");
            return;
        }

        if (isRegistering && formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            toast.error("Password must be at least 8 characters long");
            return;
        }
        
        setIsLoading(true);

        try {
            const url = isRegistering ? REGISTER_URL : API_URL;
            const response = await axios.post(url, formData);

            if (response.data.success) {
                toast.success(`${isRegistering ? "Registration" : "Login"} successful!`);

                if (isRegistering) {
                    setIsRegistering(false);
                    setFormData({ email: '', password: '', confirmPassword: '' });
                } else {
                    // Set authentication state
                    localStorage.setItem('isAuthenticated', 'true');
                navigate("/mainapp"); 
                }
            } else {
                setError(response.data.message || "Invalid email or password.");
                toast.error(response.data.message || `${isRegistering ? "Registration" : "Login"} failed.`);
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "Error connecting to server or invalid credentials.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            toast.error("Please enter your email address");
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await axios.post("http://localhost:5000/forgot-password", { email: formData.email });
            if (response.data.success) {
                toast.success("Password reset instructions sent to your email");
                setForgotPassword(false);
            } else {
                toast.error(response.data.message || "Failed to process request");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error processing your request. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderForgotPasswordForm = () => (
        <div className="cssbox1">
            <form onSubmit={handleForgotPassword}>
                <h2>Password Recovery</h2>
                <div className="mb-3">
                    <label htmlFor="reset-email" className="form-label">Email Address</label>
                    <input
                        type="email"
                        className="form-control"
                        id="reset-email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div className="cssloginbutton">
                    <button type="submit" className="btn" id="cssloginbutton" disabled={isLoading}>
                        {isLoading ? "Processing..." : "Submit Request"}
                    </button>
                </div>
                <div className="switch-form">
                    <button
                        type="button"
                        onClick={() => setForgotPassword(false)}
                        className="btn btn-link"
                    >
                        Return to Login
                    </button>
                </div>
            </form>
        </div>
    );

    const renderLoginRegisterForm = () => (
        <div className="cssbox1">
            <form onSubmit={handleSubmit}>
                <h2>{isRegistering ? "Create Account" : "Sign In"}</h2>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>

                {isRegistering && (
                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="cssloginbutton">
                    <button type="submit" className="btn" id="cssloginbutton" disabled={isLoading}>
                        {isLoading ? "Processing..." : (isRegistering ? "Register" : "Login")}
                    </button>
                </div>

                {!isRegistering && (
                    <div className="forgot-password">
                        <button
                            type="button"
                            onClick={() => setForgotPassword(true)}
                            className="btn btn-link"
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}

                <div className="switch-form">
                    <p>{isRegistering ? "Already have an account?" : "Don't have an account?"}</p>
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError("");
                            setFormData({ email: '', password: '', confirmPassword: '' });
                        }}
                        className="btn btn-link"
                    >
                        {isRegistering ? "Sign In" : "Create Account"}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="signincontainer">
            <div className="signintop">
                <img src={brgyLogo} alt="Barangay Logo" id="tambacanlogo" />
                <div id="signintitle">Del Carmen Profiling System</div>
                <img src={iliganLogo} alt="Iligan City Logo" id="iliganlogo"/>
            </div>
            
            {forgotPassword ? renderForgotPasswordForm() : renderLoginRegisterForm()}
            
            <div className="copyright">
                &copy; {currentYear} Barangay Del Carmen Information System
            </div>
            <ToastContainer position="top-center" />
        </div>
    );
}

export default Signin;