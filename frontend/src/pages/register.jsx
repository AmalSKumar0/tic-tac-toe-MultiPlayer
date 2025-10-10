import Form from "../components/Form"
import FloatingIcons from '../components/FloatingIcons';

function Register() {
    return (
        <>
            <Form route="/api/user/register/" method="register" />
            <a href="/login">Already have an account? Login here.</a>
            <FloatingIcons />
        </>
    )
}

export default Register