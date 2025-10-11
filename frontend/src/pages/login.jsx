import { Link } from "react-router-dom";
import Form from "../components/Form";
import FloatingIcons from '../components/FloatingIcons';

function Login() {
    return (
        <>
            <Form route="/api/token/" method="login" />
            <Link to="/register">Don't have an account? Register here.</Link>
            <FloatingIcons />
        </>
    );
}

export default Login;