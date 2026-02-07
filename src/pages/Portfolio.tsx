import React, { useEffect, useRef, useState } from "react";
import "./Portfolio.css";
import daplogo from "../assets/daplogo.png";

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
}

export const Portfolio: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [, setMousePos] = useState({ x: 0, y: 0 });
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Custom cursor with smooth follow
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (cursorRef.current && cursorDotRef.current) {
        cursorDotRef.current.style.left = e.clientX + "px";
        cursorDotRef.current.style.top = e.clientY + "px";

        requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.left = e.clientX + "px";
            cursorRef.current.style.top = e.clientY + "px";
          }
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Enhanced scroll with parallax
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

      // Parallax effect for hero
      const hero = document.querySelector(".hero-content") as HTMLElement;
      if (hero) {
        const scrollY = window.scrollY;
        hero.style.transform = `translateY(${scrollY * 0.5}px)`;
        hero.style.opacity = `${Math.max(0, 1 - scrollY / 800)}`;
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Enhanced scroll animations with stagger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
          }
        });
      },
      { threshold: 0.1, rootMargin: "-80px" },
    );

    // Fetch GitHub projects
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/users/DepParmar/repos?sort=stars&per_page=6",
        );
        const data = await response.json();
        const filtered = data
          .filter((repo: any) => !repo.fork)
          .slice(0, 6)
          .map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            description: repo.description || "No description",
            url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
          }));
        setProjects(filtered);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();

    // Observe all animatable elements
    document
      .querySelectorAll(
        ".capability-cell, .arsenal-item, .section-header, .project-card, .contact-content",
      )
      .forEach((el) => {
        observer.observe(el);
      });

    // Magnetic effect on interactive elements
    const magneticElements = document.querySelectorAll(
      ".capability-cell, .arsenal-item",
    );

    magneticElements.forEach((el) => {
      const element = el as HTMLElement;

      element.addEventListener("mouseenter", () => {
        if (cursorRef.current) {
          cursorRef.current.classList.add("cursor-hover");
        }
      });

      element.addEventListener("mouseleave", () => {
        if (cursorRef.current) {
          cursorRef.current.classList.remove("cursor-hover");
        }
        element.style.transform = "translate(0, 0) scale(1)";
      });

      element.addEventListener("mousemove", (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = element.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left - rect.width / 2;
        const y = mouseEvent.clientY - rect.top - rect.height / 2;

        element.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) scale(1.02)`;
      });
    });

    // Email hover effect
    const emailEl = document.querySelector(".contact-email") as HTMLElement;
    if (emailEl) {
      emailEl.addEventListener("mouseenter", () => {
        if (cursorRef.current) {
          cursorRef.current.classList.add("cursor-hover");
        }
      });

      emailEl.addEventListener("mouseleave", () => {
        if (cursorRef.current) {
          cursorRef.current.classList.remove("cursor-hover");
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="portfolio-page">
      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor"></div>
      <div ref={cursorDotRef} className="custom-cursor-dot"></div>

      <div className="bg-layer"></div>
      <div className="grid-overlay"></div>
      <div className="ambient-glow" id="glow"></div>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-main">
            <div className="logo-mark">
              <img src={daplogo} alt="DAP Logo" className="logo-image" />
            </div>
          </div>

          <h1 className="hero-title fade-in-up">
            DAP <span className="hero-subtitle">STUDIOS</span>
          </h1>
          <p className="hero-tagline fade-in-up delay-1">
            Adapt · Elevate · Amplify
          </p>
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
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <h3 className="capability-name">Graphic Design</h3>
            <p className="capability-desc">
              Creative branding, logos, posters, and print materials that define
              your visual identity.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <h3 className="capability-name">Social Media Marketing</h3>
            <p className="capability-desc">
              Strategic growth, ad campaigns, and content management to boost
              online engagement.
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
            <span className="arsenal-name">Design</span>
            <span className="arsenal-type">
              Photoshop · Illustrator · InkScape · Figma
            </span>
          </div>
        </div>
      </section>

      <section className="revolving-section">
        <div className="revolving-container">
          <div className="revolving-carousel">
            <div className="revolving-item">
              <span className="revolving-label">React</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">TypeScript</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">Firebase</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">Tailwind</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">Node.js</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">Python</span>
            </div>
          </div>
          <p className="revolving-text">Featured Technologies</p>
        </div>
      </section>

      <section className="projects">
        <div className="section-header">
          <p className="section-number">// 03</p>
          <h2 className="section-title">Projects</h2>
        </div>

        <div className="projects-grid">
          {loading ? (
            <p style={{ color: "rgba(224, 224, 224, 0.5)" }}>
              Loading projects...
            </p>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card"
              >
                <div className="project-header">
                  <h3 className="project-name">{project.name}</h3>
                  <span className="project-stars">★ {project.stars}</span>
                </div>
                <p className="project-desc">{project.description}</p>
                {project.language && (
                  <span className="project-lang">{project.language}</span>
                )}
              </a>
            ))
          ) : (
            <p style={{ color: "rgba(224, 224, 224, 0.5)" }}>
              No projects found
            </p>
          )}
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
          <p className="footer-text">DAP Studios</p>
          <p className="footer-year">EST. 2025</p>
        </div>
      </footer>

      <div className="status-bar">
        <div className="status-progress" id="progress"></div>
      </div>
    </div>
  );
};
