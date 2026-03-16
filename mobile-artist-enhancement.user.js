// ==UserScript==
// @name         ApexGirl Artist Page Mobile Enhancement
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Improves the mobile appearance of the ApexGirl artist page
// @author       You
// @match        *://apexgirlguide.com/*/artists/
// @match        *://www.apexgirlguide.com/*/artists/
// @match        http://localhost:3000/*/artists/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addGlobalStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    const mobileCss = `
        /* Mobile Navbar - Show and improve */
        @media (max-width: 900px) {
            .header .nav {
                display: flex !important;
                position: fixed !important;
                top: 60px !important;
                left: 0 !important;
                right: 0 !important;
                background: rgba(10, 10, 18, 0.95) !important;
                backdrop-filter: blur(10px) !important;
                flex-direction: column !important;
                padding: 16px !important;
                gap: 8px !important;
                border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                z-index: 999 !important;
                transform: translateY(-100%);
                transition: transform 0.3s ease !important;
            }
            
            .header .nav.open {
                transform: translateY(0);
            }
            
            .header .nav a {
                padding: 14px 20px !important;
                font-size: 1rem !important;
                background: rgba(255,255,255,0.05) !important;
                border-radius: 8px !important;
                margin: 0 !important;
            }
            
            .header .logo img {
                height: 45px !important;
            }
            
            .header .logo span {
                font-size: 1rem !important;
            }
            
            /* Mobile menu toggle button */
            .mobile-menu-toggle {
                display: flex !important;
                flex-direction: column;
                gap: 5px;
                background: none !important;
                border: none !important;
                padding: 8px !important;
                cursor: pointer !important;
            }
            
            .mobile-menu-toggle span {
                display: block;
                width: 24px;
                height: 2px;
                background: #fff;
                border-radius: 2px;
                transition: all 0.3s ease;
            }
        }

        /* Artist Page Layout - Stack vertically on mobile */
        @media (max-width: 768px) {
            /* Container adjustments */
            .container {
                padding: 20px 12px !important;
            }
            
            /* Left panel becomes full width and stacks on top */
            .left-panel {
                width: 100% !important;
                max-width: none !important;
                position: relative !important;
                top: 0 !important;
                left: 0 !important;
                margin-bottom: 16px !important;
            }
            
            .artists-container {
                margin-left: 0 !important;
                width: 100% !important;
                min-height: auto !important;
            }
            
            /* Make artist cards more touch-friendly */
            .artists-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 10px !important;
            }
            
            .artists-grid button {
                border-radius: 12px !important;
                aspect-ratio: 3/4 !important;
            }
            
            /* Search/filter section improvements */
            .artists-container > div:first-child {
                padding: 12px !important;
                margin-bottom: 12px !important;
            }
            
            .artists-container input,
            .artists-container select {
                padding: 14px 16px !important;
                font-size: 1rem !important;
                margin-bottom: 10px !important;
                border-radius: 10px !important;
            }
            
            .artists-container > div:first-child > div:last-child {
                flex-wrap: wrap !important;
            }
            
            .artists-container select {
                min-width: 100% !important;
                flex: none !important;
            }
            
            /* Title adjustments */
            h1 {
                font-size: 1.8rem !important;
            }
            
            /* Overview card improvements */
            .left-panel > div:first-child {
                margin-bottom: 12px !important;
            }
            
            /* Team builder improvements */
            .left-panel > div:nth-child(2) {
                padding: 12px !important;
            }
            
            .left-panel > div:nth-child(2) > div:first-child {
                font-size: 0.85rem !important;
                margin-bottom: 10px !important;
            }
            
            /* Team slots - larger touch targets */
            .left-panel > div:nth-child(2) > div:nth-child(2) {
                gap: 8px !important;
            }
            
            .left-panel > div:nth-child(2) > div:nth-child(2) > div {
                width: 55px !important;
                height: 55px !important;
                border-radius: 10px !important;
            }
            
            /* Stats grid - single column on mobile */
            .left-panel > div:nth-child(2) > div:nth-child(3),
            .left-panel > div:nth-child(2) > div:nth-child(4) {
                padding: 8px !important;
            }
            
            .left-panel > div:nth-child(2) > div:nth-child(3) > div {
                grid-template-columns: 1fr !important;
                gap: 6px !important;
                font-size: 0.75rem !important;
            }
            
            /* Buttons - larger touch targets */
            .left-panel button {
                padding: 12px 16px !important;
                font-size: 0.9rem !important;
                border-radius: 10px !important;
                min-height: 44px !important;
            }
            
            /* Skills text - readable on mobile */
            .left-panel p {
                font-size: 0.75rem !important;
                line-height: 1.4 !important;
            }
            
            /* Genre tags */
            .left-panel > div:nth-child(2) > div:last-child > div {
                gap: 6px !important;
            }
            
            .left-panel > div:nth-child(2) > div:last-child span {
                padding: 4px 10px !important;
                font-size: 0.7rem !important;
            }
            
            /* Reduce header height */
            :root {
                --header-height: 60px !important;
            }
            
            .header {
                height: 60px !important;
            }
            
            .main-content {
                padding-top: 60px !important;
            }
            
            /* Mobile menu toggle visibility */
            .mobile-menu-toggle {
                display: flex !important;
            }
        }

        /* Very small screens */
        @media (max-width: 380px) {
            .artists-grid {
                grid-template-columns: repeat(1, 1fr) !important;
            }
            
            .artists-grid button {
                aspect-ratio: 1/1 !important;
            }
            
            .left-panel > div:nth-child(2) > div:nth-child(2) > div {
                width: 50px !important;
                height: 50px !important;
            }
        }

        /* Always show mobile menu toggle on mobile */
        @media (max-width: 900px) {
            .mobile-menu-toggle {
                display: flex !important;
            }
        }
        
        /* Hide toggle on desktop */
        @media (min-width: 901px) {
            .mobile-menu-toggle {
                display: none !important;
            }
        }
    `;

    addGlobalStyle(mobileCss);

    // Add mobile menu toggle button
    function addMobileMenuToggle() {
        if (document.querySelector('.mobile-menu-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '<span></span><span></span><span></span>';
        toggle.setAttribute('aria-label', 'Toggle menu');
        
        const header = document.querySelector('.header-inner');
        if (header) {
            header.appendChild(toggle);
            
            toggle.addEventListener('click', () => {
                const nav = document.querySelector('.header .nav');
                if (nav) {
                    nav.classList.toggle('open');
                }
            });
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addMobileMenuToggle);
    } else {
        addMobileMenuToggle();
    }

    console.log('ApexGirl Artist Page Mobile Enhancement loaded');
})();
