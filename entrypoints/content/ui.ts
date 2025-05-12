import { FOCUS_STYLE, HELPS, MARKED_STYLE } from './constants';

export function addStyles(): void {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .${FOCUS_STYLE} {
      background-color: rgba(66, 133, 244, 0.1);
      border-left: 3px solid #4285f4;
      padding-left: 8px;
      margin-left: -11px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    .${MARKED_STYLE} {
      background-color: rgba(255, 193, 7, 0.15);
      border-left: 3px solid #ffc107;
      padding-left: 8px;
      margin-left: -11px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    .${FOCUS_STYLE}.${MARKED_STYLE} {
      background-color: rgba(76, 175, 80, 0.15);
      border-left: 3px solid #4caf50;
    }
    .gsc-copy-feedback {
      background-color: rgba(3, 169, 244, 0.2) !important;
      border-left-color: #03a9f4 !important;
      transition: all 0.2s ease !important;
    }
    .gsc-toast-notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .gsc-toast-notification.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    #gsc-help-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10001;
      display: none;
    }
    #gsc-help-overlay .gsc-help-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #272822;
      color: #f8f8f2;
      padding: 20px;
      border-radius: 8px;
      max-width: 80%;
      max-height: 80%;
      overflow: auto;
      font-family: monospace;
      font-size: 14px;
    }
    #gsc-help-overlay .gsc-help-content h2 {
      margin-top: 0;
      color: #66d9ef;
    }
    #gsc-help-overlay .gsc-help-content dl {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 8px;
      align-items: start;
    }
    #gsc-help-overlay .gsc-help-content dt {
      justify-self: end;
    }
    #gsc-help-overlay .gsc-help-content dd {
      justify-self: start;
    }
    #gsc-help-overlay kbd {
      display: inline-block;
      padding: 2px 6px;
      background: rgba(39, 40, 34, 0.8);
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: monospace;
      vertical-align: middle;
    }
  `;
  document.head.appendChild(styleEl);
}

export function showToastNotification(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'gsc-toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);
  // Force reflow to apply transition
  void toast.offsetWidth;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
}

export function createHelpOverlay(): void {
  if (document.getElementById('gsc-help-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'gsc-help-overlay';

  let content = '<div class="gsc-help-content"><h2>Help</h2>';
  for (const section of Object.keys(HELPS) as Array<keyof typeof HELPS>) {
    const title = section.charAt(0).toUpperCase() + section.slice(1);
    content += `<h3># ${title}</h3><dl>`;
    for (const [key, desc] of Object.entries(HELPS[section])) {
      content += `<dt><kbd>${key}</kbd></dt><dd>${desc}</dd>`;
    }
    content += '</dl>';
  }
  content += '</div>';
  overlay.innerHTML = content;
  document.body.appendChild(overlay);
}

export function showHelp(): void {
  createHelpOverlay();
  const overlay = document.getElementById('gsc-help-overlay') as HTMLDivElement;
  overlay.style.display = 'block';
}

export function hideHelp(): void {
  const overlay = document.getElementById('gsc-help-overlay');
  if (overlay) overlay.style.display = 'none';
}

export function toggleHelp(): void {
  const overlay = document.getElementById('gsc-help-overlay');
  if (overlay && overlay.style.display === 'block') hideHelp();
  else showHelp();
}
