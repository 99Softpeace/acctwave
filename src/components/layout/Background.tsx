'use client';

import { useEffect, useRef } from 'react';

export default function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let animationFrameId: number;
        let mouse = { x: 0, y: 0 };

        // Icons paths (simplified SVG paths) - Removed music icon
        const icons = {
            heart: new Path2D('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'),
            bolt: new Path2D('M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C7.56 12.72 9.6 8.54 12.22 3c.15-.31.42-.35.63-.35h4.86c.4 0 .61.45.33.74-.29.29-.07.03-.09.06L14.5 9h3.8c.66 0 .88.58.48 1.05-.4.47-.14.17-.16.21L11 21z'),
            play: new Path2D('M8 5v14l11-7z'),
            comment: new Path2D('M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z'),
            like: new Path2D('M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z')
        };

        const colors = ['#FF3B30', '#007AFF', '#34C759', '#FFD60A', '#FF2D55', '#5856D6'];

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            icon: Path2D;
            rotation: number;
            rotationSpeed: number;
            scale: number;
            originalX: number;
            originalY: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.originalX = this.x;
                this.originalY = this.y;
                this.size = Math.random() * 20 + 15; // 15-35px
                this.speedX = (Math.random() - 0.5) * 1;
                this.speedY = (Math.random() - 0.5) * 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                const iconKeys = Object.keys(icons) as Array<keyof typeof icons>;
                this.icon = icons[iconKeys[Math.floor(Math.random() * iconKeys.length)]];
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                this.scale = 0;
            }

            update(mouse: { x: number, y: number }) {
                // Mouse repulsion
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 200;

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = dx / distance;
                    const directionY = dy / distance;
                    this.x -= directionX * force * 5;
                    this.y -= directionY * force * 5;
                } else {
                    // Return to original position (drift)
                    this.x += this.speedX;
                    this.y += this.speedY;
                }

                // Wrap around screen
                if (this.x < -50) this.x = width + 50;
                if (this.x > width + 50) this.x = -50;
                if (this.y < -50) this.y = height + 50;
                if (this.y > height + 50) this.y = -50;

                this.rotation += this.rotationSpeed;
                if (this.scale < 1) this.scale += 0.01;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.scale(this.scale, this.scale);

                // Glow effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;

                ctx.fillStyle = this.color;
                // Center the icon
                ctx.translate(-12, -12);
                ctx.fill(this.icon);

                ctx.restore();
            }
        }

        const particles: Particle[] = Array.from({ length: 30 }, () => new Particle());

        const animate = () => {
            ctx.fillStyle = '#080B1A';
            ctx.fillRect(0, 0, width, height);

            // Draw particles
            particles.forEach(particle => {
                particle.update(mouse);
                particle.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
}
