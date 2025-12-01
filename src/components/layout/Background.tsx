'use client';

import { useEffect, useRef } from 'react';

export default function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Configuration
        const particleCount = Math.min(Math.floor((width * height) / 10000), 150); // More particles
        const connectionDistance = 120; // Shorter connections for tighter network
        const moveSpeed = 0.4; // Slightly slower, more graceful


        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * moveSpeed;
                this.vy = (Math.random() - 0.5) * moveSpeed;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = '#00FFFF'; // Cyan particles
                ctx.fill();
            }
        }

        let particles: Particle[] = [];

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        };

        const drawConnections = () => {
            if (!ctx) return;
            const time = Date.now() * 0.001; // Current time in seconds

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = 1 - distance / connectionDistance;

                        // Draw connection line
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 122, 255, ${opacity * 0.2})`; // Subtle Blue
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();

                        // "Data Stream" effect: Moving packets
                        // Use a pseudo-random offset based on particle indices so flows are independent
                        const flowSpeed = 1.0;
                        const flowOffset = (particles[i].x * particles[j].y) % 1000;
                        const progress = (time * flowSpeed + flowOffset) % 1;

                        // Only draw packet if connection is strong enough
                        if (opacity > 0.2) {
                            const packetX = particles[i].x + (particles[j].x - particles[i].x) * progress;
                            const packetY = particles[i].y + (particles[j].y - particles[i].y) * progress;

                            ctx.beginPath();
                            ctx.arc(packetX, packetY, 1.5, 0, Math.PI * 2);
                            // Cyan packet with glow
                            ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
                            ctx.shadowBlur = 4;
                            ctx.shadowColor = '#00FFFF';
                            ctx.fill();
                            ctx.shadowBlur = 0; // Reset shadow
                        }
                    }
                }
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Draw background gradient
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#080B1A');
            gradient.addColorStop(1, '#050711');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            drawConnections();

            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize
        handleResize();
        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
        />
    );
}
