import React, { useEffect, useRef } from "react";
import "./Portfolio.css";
import daplogo from "../assets/daplogo.png";

export const Portfolio: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<any>(null);

  useEffect(() => {
    // Initialize black ball
    initBall();

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
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      if (ballRef.current) {
        ballRef.current.destroy();
      }
    };
  }, []);

  const initBall = async () => {
    const THREE = await import("three");

    const container = canvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create ferrofluid material with intense metallic sheen - authentic liquid metal look
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d0d0d,
      roughness: 0.1,
      wireframe: false,
      emissive: 0x050505,
      metalness: 0.95,
      side: THREE.DoubleSide,
    });

    // Ultra-smooth rounded geometry for smooth ferrofluid
    const geometry = new THREE.IcosahedronGeometry(0.5, 128);
    const ball = new THREE.Mesh(geometry, ballMaterial);
    // Apply smooth normals for rounder appearance
    geometry.computeVertexNormals();
    scene.add(ball);

    // Store original positions for ferrofluid spike generation
    const positionAttribute = geometry.getAttribute("position");
    const originalPositions = new Float32Array(positionAttribute.array);

    // Add strong directional lights to highlight spikes dramatically
    const light1 = new THREE.DirectionalLight(0xffffff, 1.2);
    light1.position.set(8, 8, 8);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x888888, 0.8);
    light2.position.set(-8, -8, -8);
    scene.add(light2);

    const light3 = new THREE.DirectionalLight(0xaaaaaa, 0.6);
    light3.position.set(0, 5, -5);
    scene.add(light3);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();
    const magnetPos = new THREE.Vector3(0, 0, 0);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse following for magnet position
      targetMouse.lerp(mouse, 0.06);
      magnetPos.x = targetMouse.x * 2.5;
      magnetPos.y = targetMouse.y * 2.5;
      magnetPos.z = 0.5;

      // Simple circle with short spike edges when cursor approaches
      const positions = positionAttribute.array as Float32Array;

      // Calculate cursor proximity
      const cursorDist = Math.sqrt(
        magnetPos.x * magnetPos.x + magnetPos.y * magnetPos.y
      );
      const proximityCurve = Math.max(0, 1 - cursorDist / 3); // 0 when far, 1 when close
      const spikeStrength = proximityCurve * 0.25; // Short spikes intensity

      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const y = originalPositions[i + 1];
        const z = originalPositions[i + 2];

        // Vertex radius from center
        const vertexRadius = Math.sqrt(x * x + y * y + z * z);
        const normalX = vertexRadius > 0 ? x / vertexRadius : 0;
        const normalY = vertexRadius > 0 ? y / vertexRadius : 0;
        const normalZ = vertexRadius > 0 ? z / vertexRadius : 0;

        // Vector from vertex to magnet
        const dx = magnetPos.x - x;
        const dy = magnetPos.y - y;
        const dz = magnetPos.z - z;
        const distToMagnet = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Normalize direction to magnet
        const dirX = distToMagnet > 0 ? dx / distToMagnet : 0;
        const dirY = distToMagnet > 0 ? dy / distToMagnet : 0;
        const dirZ = distToMagnet > 0 ? dz / distToMagnet : 0;

        // Only affect vertices facing magnet direction
        const facingMagnet = Math.max(
          0,
          (x * dirX + y * dirY + z * dirZ) / Math.max(vertexRadius, 0.001)
        );

        // Short spikes that grow when cursor is close
        const spikeAmount = spikeStrength * facingMagnet;

        // Vertex position: original + small outward spike toward cursor
        positions[i] = x + normalX * spikeAmount;
        positions[i + 1] = y + normalY * spikeAmount;
        positions[i + 2] = z + normalZ * spikeAmount;
      }
      positionAttribute.needsUpdate = true;
      geometry.computeVertexNormals();

      // Distance from magnet
      const magnetDistance = magnetPos.length();
      const proximityPull = Math.max(0, 1 - magnetDistance / 5) * 0.4;

      // Rotation towards magnet
      ball.rotation.x += (targetMouse.y * 0.4 - ball.rotation.x) * 0.06;
      ball.rotation.y += (targetMouse.x * 0.4 - ball.rotation.y) * 0.06;
      ball.rotation.z += 0.0012;

      // Scale pulse: larger near magnet
      const pulseScale = 1 + proximityPull * 0.3 + Math.sin(time * 3) * 0.08;
      ball.scale.set(pulseScale, pulseScale, pulseScale);

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    ballRef.current = {
      destroy: () => {
        cancelAnimationFrame(animationId);
        container.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
        geometry.dispose();
        ballMaterial.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement))
          container.removeChild(renderer.domElement);
      },
    };
  };

  return (
    <div className="portfolio-page">
      <div className="bg-layer"></div>
      <div className="grid-overlay"></div>
      <div className="ambient-glow" id="glow"></div>

      <section className="hero">
        <div ref={canvasRef} className="ferrofluid-canvas"></div>
        <div className="hero-content">
          <div className="logo-mark">
            <img src={daplogo} alt="DAP Logo" className="logo-image" />
          </div>
          {/* <h1 className="hero-title">
            DAP <span className="hero-subtitle">STUDIOS</span>
          </h1>
          <p className="hero-tagline">Adapt · Elevate · Amplify</p> */}
        </div>
      </section>

      <section className="capabilities">
        <div className="section-header">
          <p className="section-number">// 01</p>
          <h2 className="section-title">Services</h2>
        </div>

        <div className="capability-grid">
          {/* 1. Web Development */}
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

          {/* 2. Mobile Apps */}
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

          {/* 3. Custom Software */}
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

          {/* 4. UI/UX Design */}
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

          {/* 5. Graphic Design */}
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

          {/* 6. Social Media Marketing */}
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
