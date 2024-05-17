import React from "react";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
    const navigate = useNavigate();
    navigate("/admin")

    return <h1>Miejsce na Landing Page. </h1>;
}