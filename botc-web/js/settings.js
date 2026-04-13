/**
 * Settings toggle — colorblind mode
 * Injects a gear button into the page and persists preference in localStorage.
 */
(function() {
    // Inject HTML
    const container = document.createElement('div');
    container.className = 'settings-toggle';
    container.innerHTML = `
        <button class="settings-btn" title="Settings" aria-label="Settings">⚙</button>
        <div class="settings-panel">
            <label>
                <input type="checkbox" id="colorblind-toggle">
                Colorblind mode
            </label>
        </div>
    `;
    document.body.appendChild(container);

    const btn = container.querySelector('.settings-btn');
    const panel = container.querySelector('.settings-panel');
    const checkbox = container.querySelector('#colorblind-toggle');

    // Toggle panel
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
        panel.classList.remove('open');
    });
    panel.addEventListener('click', (e) => e.stopPropagation());

    // Apply colorblind mode
    function applyColorblind(enabled) {
        document.documentElement.setAttribute('data-colorblind', enabled);
        localStorage.setItem('botc-colorblind', enabled);
        checkbox.checked = enabled;

        // Update any Chart.js instances (e.g., Rating line goes white when Good goes blue)
        if (window.Chart) {
            Chart.helpers.each(Chart.instances, (chart) => {
                chart.data.datasets.forEach(ds => {
                    // Rating line: blue (#60a5fa) in normal → white in colorblind (since Good becomes blue)
                    if (ds.label === 'Rating') {
                        ds.borderColor = enabled ? '#ffffff' : '#60a5fa';
                        ds.backgroundColor = enabled ? 'rgba(255,255,255,0.1)' : 'rgba(96,165,250,0.1)';
                    }
                    // Good Win % line
                    if (ds.label === 'Good Win %') {
                        ds.borderColor = enabled ? '#60a5fa' : '#4ade80';
                    }
                    // Evil Win % line
                    if (ds.label === 'Evil Win %') {
                        ds.borderColor = enabled ? '#f97316' : '#f87171';
                    }
                    // Overall Win % line: keep purple in both modes (already #a78bfa)
                    // but ensure it's not blue
                    if (ds.label === 'Overall Win %') {
                        ds.borderColor = '#a78bfa';
                    }
                });
                chart.update('none');
            });
        }
    }

    // Load saved preference
    const saved = localStorage.getItem('botc-colorblind') === 'true';
    applyColorblind(saved);

    // Toggle
    checkbox.addEventListener('change', () => {
        applyColorblind(checkbox.checked);
    });
})();
