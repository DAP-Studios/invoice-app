import React, { useEffect } from "react";
import "./Portfolio.css";

export const Portfolio: React.FC = () => {
  useEffect(() => {
    // Ambient glow follows cursor
    const glow = document.getElementById("glow");
    const handleMouseMove = (e: MouseEvent) => {
      if (glow) {
        glow.style.left = e.clientX - 400 + "px";
        glow.style.top = e.clientY - 400 + "px";
      }
    };

    // Scroll progress bar
    const handleScroll = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const progress = document.getElementById("progress");
      if (progress) {
        progress.style.width = scrolled + "%";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    // Smooth reveal on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    document
      .querySelectorAll(".capability-cell, .arsenal-item")
      .forEach((el) => {
        (el as HTMLElement).style.opacity = "0";
        (el as HTMLElement).style.transform = "translateY(30px)";
        (el as HTMLElement).style.transition = "all 0.8s ease";
        observer.observe(el);
      });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="portfolio-page">
      <div className="bg-layer"></div>
      <div className="grid-overlay"></div>
      <div className="ambient-glow" id="glow"></div>

      <section className="hero">
        <div className="hero-content">
          <div className="logo-mark">
            <svg className="logo-svg" viewBox="0 0 100 100">
              <polygon points="20,50 50,20 80,50 50,80" />
              <circle cx="50" cy="50" r="15" />
              <line x1="50" y1="20" x2="50" y2="5" />
              <line x1="80" y1="50" x2="95" y2="50" />
              <line x1="50" y1="80" x2="50" y2="95" />
              <line x1="20" y1="50" x2="5" y2="50" />
            </svg>
          </div>
          <h1 className="hero-title">DAP</h1>
          <p className="hero-tagline">Web · Mobile · Software</p>
        </div>
      </section>

      <section className="capabilities">
        <div className="section-header">
          <p className="section-number">// 01</p>
          <h2 className="section-title">Services</h2>
        </div>

        <div className="capability-grid">
          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <h3 className="capability-name">Web Development</h3>
            <p className="capability-desc">
              Responsive, fast, and scalable websites built with modern
              frameworks and clean architecture.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 19H7V4h10v16z" />
              <circle cx="12" cy="16" r="1" />
            </svg>
            <h3 className="capability-name">Mobile Apps</h3>
            <p className="capability-desc">
              Native and cross-platform applications designed for performance,
              usability, and engagement.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
            </svg>
            <h3 className="capability-name">Custom Software</h3>
            <p className="capability-desc">
              Tailored solutions for business automation, dashboards, APIs, and
              internal tools.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <h3 className="capability-name">UI/UX Design</h3>
            <p className="capability-desc">
              User-centered interfaces that balance aesthetics, function, and
              accessibility.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            <h3 className="capability-name">Brand Strategy</h3>
            <p className="capability-desc">
              Cohesive identity systems — from naming to visual language — that
              resonate with your audience.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            <h3 className="capability-name">Technical Consulting</h3>
            <p className="capability-desc">
              Architecture reviews, tech stack guidance, and scalable system
              planning.
            </p>
          </div>
        </div>
      </section>

      <section className="arsenal">
        <div className="section-header">
          <p className="section-number">// 02</p>
          <h2 className="section-title">Stack</h2>
        </div>

        <div className="arsenal-list">
          <div className="arsenal-item">
            <span className="arsenal-name">Frontend</span>
            <span className="arsenal-type">
              React · Vue · TypeScript · Tailwind
            </span>
          </div>
          <div className="arsenal-item">
            <span className="arsenal-name">Backend</span>
            <span className="arsenal-type">
              Node.js · Python · Firebase · PostgreSQL
            </span>
          </div>
          <div className="arsenal-item">
            <span className="arsenal-name">Mobile</span>
            <span className="arsenal-type">
              React Native · Flutter · iOS · Android
            </span>
          </div>
          <div className="arsenal-item">
            <span className="arsenal-name">DevOps</span>
            <span className="arsenal-type">
              Docker · AWS · CI/CD · Monitoring
            </span>
          </div>
        </div>
      </section>

      <section className="contact">
        <div className="contact-content">
          <h2 className="contact-title">
            Start
            <br />A Project
          </h2>
          <p className="contact-subtitle">
            Looking for a reliable, detail-oriented developer?
            <br />
            Let's build something exceptional together.
          </p>
          <a href="mailto:daptechsol@gmail.com" className="contact-email">
            daptechsol@gmail.com
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-grid">
          <p className="footer-text">
            DAP Studios · Freelance Development Collective
          </p>
          <p className="footer-year">EST. 2025</p>
        </div>
      </footer>

      <div className="status-bar">
        <div className="status-progress" id="progress"></div>
      </div>
    </div>
  );
};
