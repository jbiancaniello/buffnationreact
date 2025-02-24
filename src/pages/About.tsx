// About.tsx

import React, { useEffect, useState } from "react";
import "../styles/About.css";

const About: React.FC = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("EMAIL", email);

        const mailchimpURL = "00a2d8e1f0";

        try {
            await fetch(mailchimpURL, {
                method: "POST",
                body: formData,
                mode: "no-cors",
            });
            setMessage("Successfully signed up! Check your email.");
            setEmail("");
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        }
    };

    useEffect(() => {
        document.title = "About Us";
    }
    , []);

    return (
        <div className="about-container">
            <h1 className="about-title">About Us</h1>
            <p className="about-text">Stay up to date by joining our mailing list.</p>
            <form onSubmit={handleSubmit} className="about-signup-form">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="about-email-input"
                />
                <button type="submit" className="about-signup-btn">Sign Up</button>
            </form>
            {message && <p className="about-message">{message}</p>}
        </div>
    );
};

export default About;
