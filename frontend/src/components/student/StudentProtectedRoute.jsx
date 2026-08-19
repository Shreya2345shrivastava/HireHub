import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const StudentProtectedRoute = ({children}) => {
    const {user} = useSelector(store=>store.auth);

    const navigate = useNavigate();

    useEffect(()=>{
        if(user === null){
            navigate("/login");
        } else if (user.role !== 'student') {
            navigate("/"); // Redirect non-students to their home/dashboard
        }
    },[user, navigate]);

    return (
        <>
        {children}
        </>
    )
};
export default StudentProtectedRoute;
