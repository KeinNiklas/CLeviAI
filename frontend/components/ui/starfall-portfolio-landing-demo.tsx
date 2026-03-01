'use client';

import { PortfolioPage, PortfolioPageProps } from "@/components/ui/starfall-portfolio-landing";

const customPortfolioData: PortfolioPageProps = {
    logo: {
        initials: 'AT',
        name: 'Alex Thompson',
    },
    navLinks: [
        { label: 'Bio', href: '#about' },
        { label: 'Work', href: '#projects' },
        { label: 'Expertise', href: '#skills' },
    ],
    resume: {
        label: 'Download CV',
        onClick: () => alert('Downloading CV...'),
    },
    hero: {
        titleLine1: 'Full-Stack Engineer &',
        titleLine2Gradient: 'UX Architect',
        subtitle: 'I build robust and scalable web applications with a strong focus on user-centric design and performance.',
    },
    ctaButtons: {
        primary: {
            label: 'Explore My Work',
            onClick: () => { document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); },
        },
        secondary: {
            label: 'Contact Me',
            onClick: () => { window.location.href = 'mailto:alex.thompson@example.com'; },
        },
    },
    projects: [
        {
            title: 'E-commerce Platform',
            description: 'A scalable online store built with Next.js, TypeScript, and Stripe.',
            tags: ['Next.js', 'Stripe', 'Vercel']
        },
        {
            title: 'SaaS Dashboard',
            description: 'A real-time analytics dashboard for a B2B software-as-a-service product.',
            tags: ['React', 'Chart.js', 'Firebase']
        },
        {
            title: 'AI Content Generator',
            description: 'Leveraging OpenAI to generate marketing copy for businesses.',
            tags: ['SvelteKit', 'OpenAI', 'Tailwind CSS'],
            imageContent: <div className="text-2xl text-white/50">🤖</div>
        },
    ],
    stats: [
        { value: '7+', label: 'Years of Experience' },
        { value: '30+', label: 'Client Projects' },
        { value: '99%', label: 'Client Satisfaction' },
    ],
    showAnimatedBackground: true,
};

const DemoOne = () => {
    return <PortfolioPage {...customPortfolioData} />;
};

export { DemoOne };
