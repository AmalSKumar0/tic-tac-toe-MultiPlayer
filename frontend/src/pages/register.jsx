import Form from "../components/Form"
import FloatingIcons from '../components/FloatingIcons';
import { Link } from "react-router-dom";

function Register() {
    return (
        <>
            <Form route="/api/user/register/" method="register" />
            <Link to="/login">Already have an account? Login here.</Link>
            <FloatingIcons />
        </>
    )
}

export default Register