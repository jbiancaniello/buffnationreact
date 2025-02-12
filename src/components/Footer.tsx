import React from "react";
import "../styles/Footer.css";
import { FaFacebook, FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer: React.FC = () => {
    return (
        <footer className="site-footer">
            <div className="social-media-icons">
                <a href="https://www.facebook.com/share/1EZnAiBxnK/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                    <FaFacebook className="social-icon" />
                </a>
                <a href="https://www.tiktok.com/@buff.nation?_t=ZT-8slUrsJ0QwA&_r=1" target="_blank" rel="noopener noreferrer">
                    <FaTiktok className="social-icon" />
                </a>
                <a href="https://www.instagram.com/_buffnation?igsh=dzN0NGR2dW9ld3dv" target="_blank" rel="noopener noreferrer">
                    <FaInstagram className="social-icon" />
                </a>
                <a href="https://www.youtube.com/@_buffnation" target="_blank" rel="noopener noreferrer">
                    <FaYoutube className="social-icon" />
                </a>
            </div>
            <div>
                <a href="https://nycfirewire.net/" target="_blank" rel="noopener noreferrer">
                    <p>Proud Partner of Fire Wire</p>
                </a>
            </div>
            <div>
                <p className="copyright">© Buff Nation 2025</p>
            </div>
        </footer>
    );
};

export default Footer;
