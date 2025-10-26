export const baseComponentStyles = `
body,
[data-mhp-theme] {
  font-family: var(--mhp-typography-font-family);
  color: var(--mhp-colors-surface-contrast);
}

button,
input,
select,
textarea {
  font: inherit;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.mhp-btn {
  appearance: none;
  border: 1px solid transparent;
  border-radius: var(--mhp-radius-md);
  padding: calc(var(--mhp-spacing-sm) * 1) calc(var(--mhp-spacing-lg) * 1.1);
  min-height: 40px;
  background: var(--mhp-colors-primary);
  color: var(--mhp-colors-on-primary);
  font-weight: var(--mhp-typography-font-weight-semi-bold);
  font-size: var(--mhp-typography-font-size-sm);
  line-height: var(--mhp-typography-line-height-normal);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--mhp-spacing-sm);
  cursor: pointer;
  transition: background-color var(--mhp-motion-duration-base) var(--mhp-motion-easing-standard),
    box-shadow var(--mhp-motion-duration-base) var(--mhp-motion-easing-standard),
    transform var(--mhp-motion-duration-base) var(--mhp-motion-easing-standard);
}

.mhp-btn[data-variant='accent'] {
  background: var(--mhp-colors-accent);
  color: var(--mhp-colors-on-accent);
}

.mhp-btn[data-variant='ghost'] {
  background: transparent;
  color: var(--mhp-colors-primary);
  border-color: var(--mhp-colors-border);
}

.mhp-btn[data-variant='danger'] {
  background: var(--mhp-colors-danger);
  color: var(--mhp-colors-on-danger);
}

.mhp-btn:hover:not([aria-disabled='true']),
.mhp-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 48, 87, 0.2);
}

.mhp-btn:focus-visible {
  outline: 3px solid var(--mhp-colors-accent);
  outline-offset: 2px;
}

.mhp-btn[aria-disabled='true'] {
  opacity: 0.6;
  cursor: not-allowed;
}

.mhp-spinner {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: var(--mhp-colors-on-primary);
  animation: mhp-spin 800ms linear infinite;
}

.mhp-btn[data-variant='accent'] .mhp-spinner {
  border-top-color: var(--mhp-colors-on-accent);
}

.mhp-btn[data-variant='ghost'] .mhp-spinner {
  border: 2px solid rgba(0, 48, 87, 0.2);
  border-top-color: var(--mhp-colors-primary);
}

.mhp-btn[data-variant='danger'] .mhp-spinner {
  border-top-color: var(--mhp-colors-on-danger);
}

.mhp-toast {
  border-radius: var(--mhp-radius-md);
  padding: var(--mhp-spacing-md) var(--mhp-spacing-lg);
  box-shadow: var(--mhp-elevation-md);
  background: var(--mhp-colors-surface);
  color: var(--mhp-colors-surface-contrast);
  border: 1px solid var(--mhp-colors-border);
  display: flex;
  align-items: flex-start;
  gap: var(--mhp-spacing-md);
}

.mhp-toast .mhp-btn {
  min-height: auto;
  padding: var(--mhp-spacing-xs) var(--mhp-spacing-sm);
  font-size: var(--mhp-typography-font-size-xs);
}

.mhp-toast[data-tone='success'] {
  border-color: var(--mhp-colors-success);
}

.mhp-toast[data-tone='info'] {
  border-color: var(--mhp-colors-info);
}

.mhp-toast[data-tone='warning'] {
  border-color: var(--mhp-colors-warning);
}

.mhp-toast[data-tone='danger'] {
  border-color: var(--mhp-colors-danger);
}

.mhp-progress {
  width: 100%;
  height: 8px;
  background: var(--mhp-colors-border);
  border-radius: var(--mhp-radius-md);
  overflow: hidden;
  position: relative;
}

.mhp-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--mhp-colors-primary), var(--mhp-colors-accent));
  transition: width var(--mhp-motion-duration-base) var(--mhp-motion-easing-standard);
}

.mhp-progress__bar[data-indeterminate='true'] {
  position: absolute;
  inset: 0;
  width: 40%;
  animation: mhp-progress-indeterminate 1.5s infinite;
}

.mhp-panel {
  background: var(--mhp-colors-surface);
  border-radius: var(--mhp-radius-lg);
  padding: var(--mhp-spacing-xl);
  border: 1px solid var(--mhp-colors-border);
  box-shadow: var(--mhp-elevation-sm);
}

.mhp-wizard {
  display: grid;
  gap: var(--mhp-spacing-lg);
}

.mhp-wizard__steps {
  display: flex;
  gap: var(--mhp-spacing-sm);
  list-style: none;
  padding: 0;
  margin: 0;
}

.mhp-wizard__step {
  flex: 1;
  background: var(--mhp-colors-border);
  height: 4px;
  border-radius: var(--mhp-radius-sm);
  overflow: hidden;
  position: relative;
}

.mhp-wizard__step[data-active='true'] {
  background: var(--mhp-colors-primary);
}

.mhp-wizard__step button {
  position: absolute;
  inset: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.mhp-wizard__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--mhp-spacing-sm);
}

.mhp-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 15, 40, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--mhp-spacing-xl);
  z-index: 9999;
}

.mhp-modal {
  background: var(--mhp-colors-surface);
  color: var(--mhp-colors-surface-contrast);
  padding: var(--mhp-spacing-xl);
  border-radius: var(--mhp-radius-lg);
  box-shadow: var(--mhp-elevation-md);
  max-width: 600px;
  width: 100%;
}

.mhp-tooltip {
  position: absolute;
  z-index: 1000;
  background: var(--mhp-colors-surface-contrast);
  color: var(--mhp-colors-surface);
  border-radius: var(--mhp-radius-sm);
  padding: var(--mhp-spacing-xs) var(--mhp-spacing-sm);
  font-size: var(--mhp-typography-font-size-xs);
  line-height: var(--mhp-typography-line-height-tight);
  box-shadow: var(--mhp-elevation-sm);
}

.mhp-tooltip__wrapper {
  position: relative;
  display: inline-block;
}

.mhp-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--mhp-spacing-sm);
}

.mhp-toggle__control {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: var(--mhp-colors-border);
  position: relative;
  transition: background-color var(--mhp-motion-duration-base) var(--mhp-motion-easing-standard);
}

.mhp-toggle__control[data-checked='true'] {
  background: var(--mhp-colors-primary);
}

.mhp-toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--mhp-colors-surface);
  box-shadow: var(--mhp-elevation-sm);
  transition: transform var(--mhp-motion-duration-base) var(--mhp-motion-easing-standard);
}

.mhp-toggle__thumb[data-checked='true'] {
  transform: translateX(20px);
}

select.mhp-dropdown {
  min-width: 220px;
  padding: var(--mhp-spacing-sm) var(--mhp-spacing-lg);
  border-radius: var(--mhp-radius-md);
  border: 1px solid var(--mhp-colors-border);
  background: var(--mhp-colors-surface);
  color: var(--mhp-colors-surface-contrast);
}

.mhp-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--mhp-spacing-xs);
  padding: 2px var(--mhp-spacing-sm);
  background: var(--mhp-colors-border);
  color: var(--mhp-colors-surface-contrast);
  border-radius: var(--mhp-radius-sm);
  font-size: var(--mhp-typography-font-size-xs);
}

.mhp-tag__close {
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  width: 20px;
  height: 20px;
  border-radius: var(--mhp-radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mhp-tag__close:focus-visible {
  outline: 2px solid var(--mhp-colors-accent);
  outline-offset: 1px;
}

.mhp-tag[data-tone='success'] {
  background: var(--mhp-colors-success);
  color: var(--mhp-colors-on-success);
}

.mhp-tag[data-tone='warning'] {
  background: var(--mhp-colors-warning);
  color: var(--mhp-colors-on-warning);
}

.mhp-tag[data-tone='danger'] {
  background: var(--mhp-colors-danger);
  color: var(--mhp-colors-on-danger);
}

.mhp-tour-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 15, 40, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: var(--mhp-spacing-xl);
}

.mhp-tour {
  max-width: 520px;
  width: 100%;
  background: var(--mhp-colors-surface);
  color: var(--mhp-colors-surface-contrast);
  border-radius: var(--mhp-radius-lg);
  padding: var(--mhp-spacing-xl);
  box-shadow: var(--mhp-elevation-md);
  display: grid;
  gap: var(--mhp-spacing-lg);
}

.mhp-tour__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mhp-template-picker {
  display: grid;
  gap: var(--mhp-spacing-lg);
}

.mhp-template-picker__search {
  display: grid;
  gap: var(--mhp-spacing-xs);
}

.mhp-template-picker__search input {
  padding: var(--mhp-spacing-sm) var(--mhp-spacing-md);
  border-radius: var(--mhp-radius-md);
  border: 1px solid var(--mhp-colors-border);
}

.mhp-template-picker__list {
  display: grid;
  gap: var(--mhp-spacing-md);
  list-style: none;
  padding: 0;
  margin: 0;
}

.mhp-template-picker__item {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  gap: var(--mhp-spacing-md);
  align-items: center;
  border: 1px solid var(--mhp-colors-border);
  border-radius: var(--mhp-radius-md);
  padding: var(--mhp-spacing-md);
  background: var(--mhp-colors-surface);
}

.mhp-template-picker__thumbnail {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.mhp-template-picker__thumbnail img {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: var(--mhp-radius-sm);
  border: 1px solid var(--mhp-colors-border);
}

.mhp-template-picker__meta h4 {
  margin: 0 0 var(--mhp-spacing-xs);
  font-size: var(--mhp-typography-font-size-md);
}

.mhp-template-picker__meta p {
  margin: 0;
  color: var(--mhp-colors-muted);
  font-size: var(--mhp-typography-font-size-sm);
}

.mhp-template-picker__empty {
  padding: var(--mhp-spacing-lg);
  text-align: center;
  border: 1px dashed var(--mhp-colors-border);
  border-radius: var(--mhp-radius-md);
}

.mhp-pdf-panel {
  display: grid;
  gap: var(--mhp-spacing-lg);
  padding: var(--mhp-spacing-lg);
  border: 1px solid var(--mhp-colors-border);
  border-radius: var(--mhp-radius-lg);
  background: var(--mhp-colors-surface);
}

.mhp-pdf-panel header h3 {
  margin: 0;
}

.mhp-pdf-panel header p {
  margin: var(--mhp-spacing-xs) 0 0;
  color: var(--mhp-colors-muted);
}

.mhp-pdf-panel__options {
  display: grid;
  gap: var(--mhp-spacing-sm);
}

@media (prefers-reduced-motion: reduce) {
  .mhp-btn,
  .mhp-progress__bar,
  .mhp-toggle__control,
  .mhp-toggle__thumb {
    transition: none !important;
  }

  .mhp-spinner {
    animation: none;
  }
}

@keyframes mhp-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes mhp-progress-indeterminate {
  0% {
    transform: translateX(-50%);
  }
  50% {
    transform: translateX(150%);
  }
  100% {
    transform: translateX(-50%);
  }
}
`;
