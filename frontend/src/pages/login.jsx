import Form from "../components/Form"
import FloatingIcons from '../components/FloatingIcons';

function Login() {
    return (
        <>
            <Form route="/api/token/" method="login" />
            <a href="/register">Don't have an account? Register here.</a>
            <FloatingIcons />
        </>
    )
}

export default Login