import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">🏦 BankApp</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Welcome, {user?.fullName || "User"}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto mt-10 p-6">
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
                    <p className="text-gray-500">Your banking dashboard is coming soon! 🚀</p>
                </div>
            </div>
        </div>
    );
}