import React, { useEffect, useState } from "react";
import "../styles/About.css";

const About: React.FC = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactMessage, setContactMessage] = useState("");
    const [contactResponse, setContactResponse] = useState("");

    // Mailing list signup function
    const handleMailingListSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "https://t4nq714x65.execute-api.us-east-2.amazonaws.com/subscribe",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                    mode: "cors", // ✅ Ensures cross-origin requests work
                }
            );

            if (response.ok) {
                setMessage("Successfully signed up! Check your email.");
                setEmail("");
            } else {
                const errorData = await response.json();
                setMessage(
                    `Error: ${errorData.message || "Something went wrong. Please try again."}`
                );
            }
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        }
    };

    // Contact Us form submission
    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("https://submit-form.com/4S3ndfNhD", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: contactName,
                    email: contactEmail,
                    message: contactMessage,
                }),
            });

            setContactResponse(
                "Thank you for reaching out! We'll get back to you soon."
            );
            setContactName("");
            setContactEmail("");
            setContactMessage("");
        } catch (error) {
            setContactResponse(
                "Thank you for reaching out! We'll get back to you soon."
            );
            setContactName("");
            setContactEmail("");
            setContactMessage("");
        }
    };

    useEffect(() => {
        document.title = "About Us";
    }, []);

    return (
        <div>
            <div className="about-container">
                <h1 className="about-title">About Buff Nation</h1>
                <p>
                    Buff Nation is your front-row seat to the world of emergency
                    response. Since 2017, we’ve been capturing the raw intensity
                    of breaking fire, police, and emergency scenes through
                    high-quality photography and video. Our mission is to
                    document the dedication of first responders while bringing
                    the action straight to those who live for it.
                </p>
                <p>
                    Through our platform, we share real-time coverage of
                    emergency incidents, giving our audience an inside look at
                    the moments that define the job. We also offer exclusive
                    merchandise and prints of our work, helping to support our
                    mission and keep Buff Nation growing. Beyond our
                    on-the-ground coverage, Buff Nation features an interactive
                    dashboard displaying real-time data on working fires across
                    Long Island. This cutting-edge tool allows buffs, first
                    responders, and the public to stay informed.
                </p>
                <p>
                    Whether you're a first responder, an emergency buff, or just
                    someone who appreciates the art of action photography, Buff
                    Nation is here to bring you closer to the frontline.
                </p>
            </div>

            {/* Two-column form section */}
            <div className="about-signup-container">
                {/* Contact Us Form (Left) */}
                <div className="about-signup-form-wrapper">
                    <p className="about-text">Contact Us</p>
                    <form
                        onSubmit={handleContactSubmit}
                        className="about-signup-form">
                        <div className="about-contact-inputs">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                required
                                className="about-email-input"
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={contactEmail}
                                onChange={(e) =>
                                    setContactEmail(e.target.value)
                                }
                                required
                                className="about-email-input"
                            />
                        </div>
                        <textarea
                            placeholder="Your Message"
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            required
                            className="about-textarea"
                        />
                        <button type="submit" className="about-signup-btn">
                            Send
                        </button>
                    </form>
                    {contactResponse && (
                        <p className="about-message">{contactResponse}</p>
                    )}
                </div>

                {/* Mailing List Signup (Right) */}
                <div className="about-signup-form-wrapper">
                    <p className="about-text">
                        Stay up to date by joining our mailing list.
                    </p>
                    <form
                        onSubmit={handleMailingListSubmit}
                        className="about-signup-form">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="about-email-input"
                        />
                        <button type="submit" className="about-signup-btn">
                            Sign Up
                        </button>
                    </form>
                    {message && <p className="about-message">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default About;
