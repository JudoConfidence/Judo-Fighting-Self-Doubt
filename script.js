// Global variables
let currentPageIndex = 0;
        const totalPages = 7;

// Initialize the pamphlet
document.addEventListener('DOMContentLoaded', function() {
    showPage(1);
    updateControls();
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            previousPage();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextPage();
        } else if (e.key === 'Home') {
            showPage(1);
        } else if (e.key === 'End') {
            showPage(totalPages);
        } else if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printPamphlet();
        }
    });
    
    // Add touch/swipe support for mobile
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Only trigger if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - next page
                nextPage();
            } else {
                // Swipe right - previous page
                previousPage();
            }
        }
        
        startX = 0;
        startY = 0;
    });
});

// Show specific page
function showPage(pageNumber) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the requested page
    const targetPage = document.getElementById(`page-${pageNumber}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPageIndex = pageNumber - 1;
        updateControls();
        
        // Scroll to top of the page content
        const pageContent = targetPage.querySelector('.page-content');
        if (pageContent) {
            pageContent.scrollTop = 0;
        }
        
        // Update URL hash for bookmarking
        window.location.hash = `page-${pageNumber}`;
        
        // Announce page change for screen readers
        announcePageChange(pageNumber);
    }
}

// Navigate to next page
function nextPage() {
    if (currentPageIndex < totalPages - 1) {
        showPage(currentPageIndex + 2);
    }
}

// Navigate to previous page
function previousPage() {
    if (currentPageIndex > 0) {
        showPage(currentPageIndex);
    }
}

// Update navigation controls
function updateControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    // Update page indicator
    if (currentPageSpan) {
        currentPageSpan.textContent = currentPageIndex + 1;
    }
    if (totalPagesSpan) {
        totalPagesSpan.textContent = totalPages;
    }
    
    // Update button states
    if (prevBtn) {
        prevBtn.disabled = currentPageIndex === 0;
        prevBtn.setAttribute('aria-label', 
            currentPageIndex === 0 ? 'Previous page (disabled)' : 'Go to previous page');
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPageIndex === totalPages - 1;
        nextBtn.setAttribute('aria-label', 
            currentPageIndex === totalPages - 1 ? 'Next page (disabled)' : 'Go to next page');
    }
}

// Print functionality with proper formatting
function printPamphlet() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the current document's head content
    const headContent = document.head.innerHTML;
    
    // Get all page content
    const pages = document.querySelectorAll('.page');
    let pagesHTML = '';
    
    pages.forEach((page, index) => {
        // Clone the page to avoid modifying the original
        const pageClone = page.cloneNode(true);
        
        // Remove any active classes and make all pages visible for print
        pageClone.classList.remove('active');
        pageClone.style.position = 'static';
        pageClone.style.opacity = '1';
        pageClone.style.visibility = 'visible';
        pageClone.style.pageBreakAfter = index < pages.length - 1 ? 'always' : 'auto';
        pageClone.style.pageBreakInside = 'avoid';
        pageClone.style.minHeight = '11in';
        
        pagesHTML += pageClone.outerHTML;
    });
    
    // Create the print document
    const printDocument = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            ${headContent}
            <style>
                @media print {
                    body {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        font-family: 'Inter', sans-serif !important;
                    }
                    
                    .pamphlet-container {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        position: static !important;
                        margin: 0 !important;
                        background: white !important;
                    }
                    
                    .page {
                        position: static !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        page-break-after: always;
                        page-break-inside: avoid;
                        height: auto !important;
                        min-height: 11in;
                        border-radius: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        overflow: visible !important;
                    }
                    
                    .page:last-child {
                        page-break-after: auto !important;
                    }
                    
                    .page-content {
                        padding: 0.5in !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    
                    /* Ensure colors print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    /* Maintain background colors and gradients */
                    .cover-page,
                    .back-cover {
                        background: linear-gradient(135deg, #fce7f3 0%, #fef3cd 100%) !important;
                    }
                    
                    .page {
                        background: linear-gradient(135deg, #fce7f3 0%, #fef3cd 50%, #f3e8ff 100%) !important;
                    }
                    
                    .key-message {
                        background: linear-gradient(135deg, #be185d, #9333ea) !important;
                        color: white !important;
                    }
                    
                    .function-over-form-final {
                        background: #be185d !important;
                        color: white !important;
                    }
                    
                    /* Adjust font sizes for print */
                    .main-title {
                        font-size: 2.5rem !important;
                    }
                    
                    .page-title {
                        font-size: 1.8rem !important;
                    }
                    
                    .section-title {
                        font-size: 1.2rem !important;
                    }
                    
                    /* Ensure images print properly */
                    img {
                        max-width: 100% !important;
                        height: auto !important;
                        page-break-inside: avoid;
                    }
                    
                    /* Grid adjustments for print */
                    .pillars-grid,
                    .stats-grid,
                    .techniques-grid,
                    .development-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }
                    
                    .resources-grid {
                        grid-template-columns: 1fr !important;
                        gap: 8px !important;
                    }
                    
                    /* Hide navigation controls */
                    .controls {
                        display: none !important;
                    }
                }
                
                @page {
                    size: 8.5in 11in;
                    margin: 0.5in;
                }
            </style>
        </head>
        <body>
            <div class="pamphlet-container">
                ${pagesHTML}
            </div>
        </body>
        </html>
    `;
    
    // Write the document to the print window
    printWindow.document.write(printDocument);
    printWindow.document.close();
    
    // Wait for images to load, then print
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            
            // Close the print window after printing
            printWindow.onafterprint = function() {
                printWindow.close();
            };
            
            // Fallback: close after 5 seconds if onafterprint doesn't fire
            setTimeout(() => {
                if (!printWindow.closed) {
                    printWindow.close();
                }
            }, 5000);
        }, 500);
    };
}

// Announce page changes for accessibility
function announcePageChange(pageNumber) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    const pageTitle = document.querySelector(`#page-${pageNumber} .page-title`)?.textContent || 
                     document.querySelector(`#page-${pageNumber} .main-title`)?.textContent || 
                     `Page ${pageNumber}`;
    
    announcement.textContent = `Now viewing ${pageTitle}, page ${pageNumber} of ${totalPages}`;
    
    document.body.appendChild(announcement);
    
    // Remove the announcement after it's been read
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Handle browser back/forward navigation
window.addEventListener('hashchange', function() {
    const hash = window.location.hash;
    const pageMatch = hash.match(/page-(\d+)/);
    
    if (pageMatch) {
        const pageNumber = parseInt(pageMatch[1]);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            showPage(pageNumber);
        }
    }
});

// Initialize from URL hash if present
window.addEventListener('load', function() {
    const hash = window.location.hash;
    const pageMatch = hash.match(/page-(\d+)/);
    
    if (pageMatch) {
        const pageNumber = parseInt(pageMatch[1]);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            showPage(pageNumber);
            return;
        }
    }
    
    // Default to page 1
    showPage(1);
});

// Add smooth scrolling for long pages
function smoothScrollToTop(element) {
    element.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Utility function to check if an element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add animation triggers for elements coming into view
function addScrollAnimations() {
    const animatedElements = document.querySelectorAll('.stat-card, .pillar-card, .technique-card, .development-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize scroll animations when DOM is ready
document.addEventListener('DOMContentLoaded', addScrollAnimations);

// Export functions for global access
window.showPage = showPage;
window.nextPage = nextPage;
window.previousPage = previousPage;
window.printPamphlet = printPamphlet;
