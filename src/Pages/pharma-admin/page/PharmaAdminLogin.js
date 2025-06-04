import { useNavigate } from "react-router-dom";

const PharmaAdminLogin = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        localStorage.setItem("isAdminLoggedIn", "true");
        navigate("/pharma-admin/dashboard");
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleLogin} className="signup-form">
                <h2>Admin Login</h2>
                <input type="text" placeholder="Username" required className="signup-input" />
                <input type="password" placeholder="Password" required className="signup-input"/>
                <button type="submit"   className="signup-button">Login</button>
            </form>
        </div>
    );
};

export default PharmaAdminLogin;
