// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const PharmaAdminLogin = () => {
//     const navigate = useNavigate();
//     const [adminName, setAdminName] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");

//     const handleLogin = (e) => {
//         e.preventDefault();
//         if (adminName === "Bsk admin" && password === "Bsk@321") {
//             localStorage.setItem("isAdminLoggedIn", "true");
//             navigate("/pharma-admin/dashboard");
//         } else {
//             setError("Invalid username or password");
//         }
//     };

//     return (
//         <div className="signup-container">
//             <form onSubmit={handleLogin} className="signup-form">
//                 <h2>Admin Login</h2>
//                 <input
//                     type="text"
//                     placeholder="Username"
//                     required
//                     className="signup-input"
//                     value={adminName}
//                     onChange={(e) => setAdminName(e.target.value)}
//                 />
//                 <input
//                     type="password"
//                     placeholder="Password"
//                     required
//                     className="signup-input"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                 />
//                 {error && <p style={{ color: "red" }}>{error}</p>}
//                 <button type="submit" className="signup-button">Login</button>
//             </form>
//         </div>
//     );
// };

// export default PharmaAdminLogin;

// PharmaAdminLogin.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PharmaAdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [adminName, setAdminName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if (adminName === "Bsk admin" && password === "Bsk@321") {
            localStorage.setItem("isAdminLoggedIn", "true");
            const redirectTo = location.state?.from?.pathname || "/pharma-admin/dashboard";
            navigate(redirectTo, { replace: true });
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleLogin} className="signup-form">
                <h2>Admin Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    required
                    className="signup-input"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    className="signup-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit" className="signup-button">Login</button>
            </form>
        </div>
    );
};

export default PharmaAdminLogin;

