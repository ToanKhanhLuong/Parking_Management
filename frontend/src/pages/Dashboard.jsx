
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
	const navigate = useNavigate();
	const userData = localStorage.getItem("user");
	const user = userData ? JSON.parse(userData) : null;

	if (!user) {
		navigate("/login");
		return null;
	}

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/login");
	};

	return (
		<div style={{padding:32}}>
			<h1>Xin chào, {user.fullname || user.username}!</h1>
			<p>Vai trò: {user.role}</p>
			<button onClick={handleLogout} style={{marginTop:16,padding:10,borderRadius:6,background:'#e11d48',color:'#fff',border:'none'}}>Đăng xuất</button>
		</div>
	);
}
