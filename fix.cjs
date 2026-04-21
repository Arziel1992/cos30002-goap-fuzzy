const fs = require('fs');

function fixApp() {
  let content = fs.readFileSync('src/App.svelte', 'utf-8');
  let footerStr = `&copy; E. Ketterer Ortiz - 
      <a href="https://github.com/Arziel1992/cos30002-goap-fuzzy/" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none; font-weight: 600;">
        <svg height="11" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="11" style="fill: currentColor; vertical-align: middle; margin-top: -2px;">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg> Repository
      </a>
    </div>`;

  content = content.replace(/&copy; E\. Ketterer Ortiz\r?\n\s*<\/div>/g, footerStr);
  fs.writeFileSync('src/App.svelte', content);
}

function fixControls() {
  let content = fs.readFileSync('src/lib/Controls.svelte', 'utf-8');

  let appendStyles = `
  .toggle-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .toggle-list button {
    padding: 0.8rem 1rem; border-radius: 12px; border: 2px solid var(--panel-border);
    background: #fff; color: var(--text-secondary);
    font-size: 0.85rem; font-weight: 700; cursor: pointer; text-align: left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .toggle-list button:hover { border-color: #cbd5e1; }
  .toggle-list button.active {
    background: #fff; border-color: var(--accent); color: var(--accent);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
  }
`;

  if (content.indexOf('.toggle-list') === -1) {
    content = content.replace('<style>', '<style>' + appendStyles);
  }

  // Also verify label-row and range exist if needed
  let rangeStyles = `
  .control-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem; }
  .label-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; font-weight: 700; }
  .label-row span { color: var(--accent); font-weight: 800; }

  input[type="range"] { appearance: none; background: #e2e8f0; height: 6px; border-radius: 3px; cursor: pointer; }
  input[type="range"]::-webkit-slider-thumb {
    appearance: none; width: 18px; height: 18px; background: #fff; 
    border: 3px solid var(--accent); border-radius: 50%; cursor: pointer;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2); transition: transform 0.1s;
  }
  input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.1); }
`;
  if (content.indexOf('.label-row') === -1) {
     content = content.replace('</style>', rangeStyles + '</style>');
  }

  fs.writeFileSync('src/lib/Controls.svelte', content);
}

fixApp();
fixControls();
