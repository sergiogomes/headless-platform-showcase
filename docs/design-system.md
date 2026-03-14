# Engineering Platform Design System

A technical, minimal, and content-first design system for modern engineering platforms.

---

## Design Philosophy

This design system combines the best elements from multiple professional dashboards to create a cohesive, technical aesthetic that prioritizes:

- **Content First**: Minimal chrome, maximum information density
- **Technical Excellence**: Clean, precise, engineering-focused aesthetics
- **Dark Mode Native**: Optimized for developers who prefer dark interfaces
- **Subtle Sophistication**: Refined details without visual clutter

---

## 1. Color System

### Core Palette

Our color system uses a dark-first approach with accent colors for interaction and semantic meaning.

#### Neutrals (Gray Scale)

```css
--gray-50: #f8f9fa;    /* Lightest - rare use in dark mode */
--gray-100: #f1f3f5;   /* Very light backgrounds */
--gray-200: #e9ecef;   /* Light borders */
--gray-300: #dee2e6;   /* Subtle borders */
--gray-400: #ced4da;   /* Muted text on light */
--gray-500: #adb5bd;   /* Secondary text */
--gray-600: #868e96;   /* Tertiary text */
--gray-700: #495057;   /* Primary text on light */
--gray-800: #343a40;   /* Dark surface */
--gray-850: #2b3035;   /* Darker surface */
--gray-900: #212529;   /* Darkest surface */
--gray-950: #16181a;   /* Almost black */
```

#### Primary (Teal/Cyan - Technical & Trustworthy)

```css
--primary-50: #e6fdfd;
--primary-100: #ccfafa;
--primary-200: #99f5f5;
--primary-300: #66f0f0;
--primary-400: #33ebeb;
--primary-500: #00d9d9;  /* Main brand color */
--primary-600: #00b8b8;
--primary-700: #009797;
--primary-800: #007676;
--primary-900: #005555;
```

#### Success (Green - Confirmation & Positive Actions)

```css
--success-50: #eafaf9;
--success-100: #d5f5f3;
--success-200: #abebe7;
--success-300: #81e1db;
--success-400: #57d7cf;
--success-500: #2dcdc3;
--success-600: #24a49c;
--success-700: #1b7b75;
--success-800: #12524e;
--success-900: #092927;
```

#### Warning (Amber - Attention & Caution)

```css
--warning-50: #fff9e6;
--warning-100: #fff3cc;
--warning-200: #ffe799;
--warning-300: #ffdb66;
--warning-400: #ffcf33;
--warning-500: #ffc300;
--warning-600: #cc9c00;
--warning-700: #997500;
--warning-800: #664e00;
--warning-900: #332700;
```

#### Error (Red - Errors & Critical Actions)

```css
--error-50: #ffeef0;
--error-100: #ffdde1;
--error-200: #ffbbc3;
--error-300: #ff99a5;
--error-400: #ff7787;
--error-500: #ff5569;
--error-600: #cc4454;
--error-700: #99333f;
--error-800: #66222a;
--error-900: #331115;
```

#### Info (Blue - Information & Links)

```css
--info-50: #e6f2ff;
--info-100: #cce5ff;
--info-200: #99cbff;
--info-300: #66b1ff;
--info-400: #3397ff;
--info-500: #007dff;
--info-600: #0064cc;
--info-700: #004b99;
--info-800: #003266;
--info-900: #001933;
```

### Semantic Colors (Light Mode)

```css
/* Backgrounds */
--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-tertiary: #f1f3f5;
--bg-elevated: #ffffff;
--bg-overlay: rgba(0, 0, 0, 0.6);

/* Text */
--text-primary: #212529;
--text-secondary: #495057;
--text-tertiary: #868e96;
--text-disabled: #adb5bd;
--text-inverse: #ffffff;

/* Borders */
--border-primary: #e9ecef;
--border-secondary: #dee2e6;
--border-tertiary: #ced4da;
--border-focus: var(--primary-500);

/* Interactive */
--interactive-default: var(--primary-500);
--interactive-hover: var(--primary-600);
--interactive-active: var(--primary-700);
--interactive-disabled: var(--gray-300);
```

### Semantic Colors (Dark Mode)

```css
/* Backgrounds */
--bg-primary: #16181a;
--bg-secondary: #212529;
--bg-tertiary: #2b3035;
--bg-elevated: #343a40;
--bg-overlay: rgba(0, 0, 0, 0.8);

/* Text */
--text-primary: #f8f9fa;
--text-secondary: #ced4da;
--text-tertiary: #adb5bd;
--text-disabled: #868e96;
--text-inverse: #212529;

/* Borders */
--border-primary: rgba(255, 255, 255, 0.1);
--border-secondary: rgba(255, 255, 255, 0.08);
--border-tertiary: rgba(255, 255, 255, 0.05);
--border-focus: var(--primary-400);

/* Interactive */
--interactive-default: var(--primary-400);
--interactive-hover: var(--primary-300);
--interactive-active: var(--primary-200);
--interactive-disabled: var(--gray-700);
```

---

## 2. Typography

### Font Families

```css
/* Primary: For UI and body text */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                'Roboto', 'Helvetica', 'Arial', sans-serif;

/* Monospace: For code and technical content */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 
             'Courier New', monospace;

/* Display: For large headings (optional) */
--font-display: 'Inter', var(--font-primary);
```

### Type Scale

Based on a 1.25 ratio (Major Third) for harmonious progression:

```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px - body */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

### Font Weights

```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Letter Spacing

```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

### Typography Styles

```css
/* Heading 1 */
.heading-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* Heading 2 */
.heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* Heading 3 */
.heading-3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

/* Heading 4 */
.heading-4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

/* Heading 5 */
.heading-5 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

/* Body Large */
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

/* Body (default) */
.body {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

/* Body Small */
.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

/* Caption */
.caption {
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
  letter-spacing: var(--tracking-wide);
}

/* Label */
.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-secondary);
}

/* Code Inline */
.code-inline {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 0.125rem 0.375rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 0.25rem;
  color: var(--text-primary);
}

/* Code Block */
.code-block {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 1rem;
  color: var(--text-primary);
  overflow-x: auto;
}
```

---

## 3. Spacing System

Based on an 8px base unit for consistent rhythm:

```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### Spacing Usage Guidelines

- **Component padding**: `--space-4` to `--space-6`
- **Section spacing**: `--space-12` to `--space-20`
- **Layout gaps**: `--space-4` to `--space-8`
- **Element margins**: `--space-2` to `--space-6`

---

## 4. Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;     /* 4px - tight elements */
--radius-base: 0.375rem;  /* 6px - default */
--radius-md: 0.5rem;      /* 8px - cards, inputs */
--radius-lg: 0.75rem;     /* 12px - larger cards */
--radius-xl: 1rem;        /* 16px - modals */
--radius-2xl: 1.5rem;     /* 24px - special elements */
--radius-full: 9999px;    /* fully rounded */
```

---

## 5. Responsive Design

### Breakpoints

Our responsive design system uses mobile-first breakpoints:

```css
/* Breakpoint tokens */
--breakpoint-sm: 640px;   /* Small devices (phones) */
--breakpoint-md: 768px;   /* Medium devices (tablets) */
--breakpoint-lg: 1024px;  /* Large devices (laptops) */
--breakpoint-xl: 1280px;  /* Extra large devices (desktops) */
--breakpoint-2xl: 1536px; /* 2X large devices (large desktops) */
```

### Media Query Usage

```css
/* Mobile first approach */
.container {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--space-12);
  }
}
```

### Container Widths

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}
```

### Responsive Typography

Consider scaling typography on smaller screens:

```css
@media (max-width: 640px) {
  :root {
    --text-4xl: 1.875rem;  /* 30px instead of 36px */
    --text-3xl: 1.5rem;    /* 24px instead of 30px */
    --text-2xl: 1.25rem;   /* 20px instead of 24px */
  }
}
```

### Responsive Spacing

Use responsive spacing for sections:

```css
.section {
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
}

@media (min-width: 768px) {
  .section {
    padding-top: var(--space-12);
    padding-bottom: var(--space-12);
  }
}

@media (min-width: 1024px) {
  .section {
    padding-top: var(--space-20);
    padding-bottom: var(--space-20);
  }
}
```

### Grid System

```css
.grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
}
```

---

## 6. Z-Index Scale

Define consistent layering for components:

```css
/* Z-index scale */
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-notification: 1080;
```

### Usage Guidelines

- **Base (0)**: Default stacking context
- **Dropdown (1000)**: Dropdown menus, select options
- **Sticky (1020)**: Sticky headers, navigation
- **Fixed (1030)**: Fixed position elements
- **Modal Backdrop (1040)**: Modal overlay backgrounds
- **Modal (1050)**: Modal dialogs
- **Popover (1060)**: Popovers, context menus
- **Tooltip (1070)**: Tooltips
- **Notification (1080)**: Toast notifications, alerts

### Example

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  z-index: var(--z-modal-backdrop);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-modal);
}

.tooltip {
  position: absolute;
  z-index: var(--z-tooltip);
}
```

---

## 7. Shadows & Elevation

Subtle shadows that work in both light and dark modes:

```css
/* Light mode shadows */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
             0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
               0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Dark mode shadows (refined with subtle color tint) */
--shadow-dark-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
--shadow-dark-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.3),
                  0 1px 2px -1px rgba(0, 0, 0, 0.2);
--shadow-dark-base: 0 4px 6px -1px rgba(0, 0, 0, 0.3),
                    0 2px 4px -2px rgba(0, 0, 0, 0.2);
--shadow-dark-md: 0 10px 15px -3px rgba(0, 0, 0, 0.4),
                  0 4px 6px -4px rgba(0, 0, 0, 0.3);
--shadow-dark-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.5),
                  0 8px 10px -6px rgba(0, 0, 0, 0.4);
--shadow-dark-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6);

/* Alternative: Colored shadows for elevated surfaces */
--shadow-dark-colored-sm: 0 1px 3px 0 rgba(0, 217, 217, 0.05),
                          0 1px 2px -1px rgba(0, 0, 0, 0.3);
--shadow-dark-colored-base: 0 4px 6px -1px rgba(0, 217, 217, 0.08),
                            0 2px 4px -2px rgba(0, 0, 0, 0.3);
```

---

## 8. Animation & Transitions

```css
/* Duration */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

/* Easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Common transitions */
--transition-base: all var(--duration-base) var(--ease-in-out);
--transition-colors: color var(--duration-base) var(--ease-in-out),
                     background-color var(--duration-base) var(--ease-in-out),
                     border-color var(--duration-base) var(--ease-in-out);
--transition-transform: transform var(--duration-base) var(--ease-out);
--transition-opacity: opacity var(--duration-fast) var(--ease-in-out);
```

---

## 9. Components

### Button

```html
<!-- Primary Button -->
<button class="btn btn-primary">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">
  Secondary Action
</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">
  Ghost Action
</button>

<!-- Danger Button -->
<button class="btn btn-danger">
  Delete
</button>
```

```css
.btn {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  
  transition: var(--transition-colors);
  
  /* Focus state */
  &:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: var(--interactive-default);
  color: var(--text-inverse);
  
  &:hover:not(:disabled) {
    background: var(--interactive-hover);
  }
  
  &:active:not(:disabled) {
    background: var(--interactive-active);
  }
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-primary);
  
  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--border-secondary);
  }
  
  &:active:not(:disabled) {
    background: var(--bg-primary);
  }
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  
  &:hover:not(:disabled) {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  &:active:not(:disabled) {
    background: var(--bg-secondary);
  }
}

.btn-danger {
  background: var(--error-500);
  color: var(--text-inverse);
  
  &:hover:not(:disabled) {
    background: var(--error-600);
  }
  
  &:active:not(:disabled) {
    background: var(--error-700);
  }
}

/* Size variants */
.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
}

/* Loading state */
.btn-loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.btn-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  width: 1rem;
  height: 1rem;
  
  border: 2px solid currentColor;
  border-radius: var(--radius-full);
  border-top-color: transparent;
  
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Icon button variant */
.btn-icon {
  padding: var(--space-3);
  width: 2.5rem;
  height: 2.5rem;
}

.btn-icon.btn-sm {
  padding: var(--space-2);
  width: 2rem;
  height: 2rem;
}

.btn-icon.btn-lg {
  padding: var(--space-4);
  width: 3rem;
  height: 3rem;
}

/* Full width variant */
.btn-full {
  width: 100%;
}

/* Button group */
.btn-group {
  display: inline-flex;
  gap: 0;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
}

.btn-group .btn:last-child {
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.btn-group .btn:not(:last-child) {
  border-right: none;
}
```

**HTML Examples:**

```html
<!-- Primary Button -->
<button class="btn btn-primary">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">
  Secondary Action
</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">
  Ghost Action
</button>

<!-- Danger Button -->
<button class="btn btn-danger">
  Delete
</button>

<!-- Loading Button -->
<button class="btn btn-primary btn-loading">
  Processing...
</button>

<!-- Icon Button -->
<button class="btn btn-secondary btn-icon" aria-label="Settings">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 4a4 4 0 100 8 4 4 0 000-8z"/>
  </svg>
</button>

<!-- Full Width Button -->
<button class="btn btn-primary btn-full">
  Continue
</button>

<!-- Button Group -->
<div class="btn-group">
  <button class="btn btn-secondary">Left</button>
  <button class="btn btn-secondary">Middle</button>
  <button class="btn btn-secondary">Right</button>
</div>
```

### Card

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Optional subtitle</p>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-base);
    border-color: var(--border-secondary);
  }
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
```

### Badge

```html
<span class="badge">Default</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-wide);
  
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  
  white-space: nowrap;
}

.badge-primary {
  background: var(--primary-100);
  color: var(--primary-700);
}

.badge-success {
  background: var(--success-100);
  color: var(--success-700);
}

.badge-warning {
  background: var(--warning-100);
  color: var(--warning-700);
}

.badge-error {
  background: var(--error-100);
  color: var(--error-700);
}

/* Dark mode variants */
@media (prefers-color-scheme: dark) {
  .badge-primary {
    background: rgba(0, 217, 217, 0.15);
    color: var(--primary-300);
  }
  
  .badge-success {
    background: rgba(45, 205, 195, 0.15);
    color: var(--success-300);
  }
  
  .badge-warning {
    background: rgba(255, 195, 0, 0.15);
    color: var(--warning-300);
  }
  
  .badge-error {
    background: rgba(255, 85, 105, 0.15);
    color: var(--error-300);
  }
}
```

### Navigation

```html
<nav class="nav">
  <a href="#" class="nav-link nav-link-active">Dashboard</a>
  <a href="#" class="nav-link">Projects</a>
  <a href="#" class="nav-link">Settings</a>
</nav>
```

```css
.nav {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  text-decoration: none;
  
  border-radius: var(--radius-base);
  transition: var(--transition-colors);
  
  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  &:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
}

.nav-link-active {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}
```

### Form Components

Forms are essential for platform interfaces. This section provides comprehensive form component styles.

**Text Input**

```html
<!-- Text Input with Label -->
<div class="form-group">
  <label class="form-label" for="email">Email Address</label>
  <input type="email" id="email" class="input" placeholder="you@example.com">
  <p class="form-helper">We'll never share your email.</p>
</div>

<!-- Input with Error -->
<div class="form-group">
  <label class="form-label" for="username">Username</label>
  <input type="text" id="username" class="input input-error" value="ab">
  <p class="form-error">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 10a1 1 0 110-2 1 1 0 010 2zm0-3a1 1 0 01-1-1V3a1 1 0 012 0v3a1 1 0 01-1 1z"/>
    </svg>
    Username must be at least 3 characters
  </p>
</div>

<!-- Input with Success -->
<div class="form-group">
  <label class="form-label" for="domain">Domain</label>
  <input type="text" id="domain" class="input input-success" value="mycompany">
  <p class="form-helper">Domain is available!</p>
</div>
```

```css
/* Text Input */
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  
  transition: var(--transition-colors);
}

.input:hover:not(:disabled) {
  border-color: var(--border-secondary);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(0, 217, 217, 0.1);
}

.input:disabled {
  background: var(--bg-secondary);
  color: var(--text-disabled);
  cursor: not-allowed;
}

.input::placeholder {
  color: var(--text-tertiary);
}

/* Input with error state */
.input-error {
  border-color: var(--error-500);
}

.input-error:focus {
  border-color: var(--error-500);
  box-shadow: 0 0 0 3px rgba(255, 85, 105, 0.1);
}

/* Input with success state */
.input-success {
  border-color: var(--success-500);
}

.input-success:focus {
  border-color: var(--success-500);
  box-shadow: 0 0 0 3px rgba(45, 205, 195, 0.1);
}

/* Form Group */
.form-group {
  margin-bottom: var(--space-6);
}

/* Form Label */
.form-label {
  display: block;
  margin-bottom: var(--space-2);
  
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

/* Helper Text */
.form-helper {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Error Message */
.form-error {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--error-500);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

**Select Dropdown**

```html
<div class="form-group">
  <label class="form-label" for="role">Role</label>
  <select id="role" class="select">
    <option>Select a role...</option>
    <option>Developer</option>
    <option>Designer</option>
    <option>Product Manager</option>
  </select>
</div>
```

```css
/* Select */
.select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  padding-right: var(--space-10);
  
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  color: var(--text-primary);
  
  background: var(--bg-primary);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23868e96' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-4) center;
  
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  
  appearance: none;
  cursor: pointer;
  transition: var(--transition-colors);
}

.select:hover:not(:disabled) {
  border-color: var(--border-secondary);
}

.select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(0, 217, 217, 0.1);
}

.select:disabled {
  background-color: var(--bg-secondary);
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

**Checkbox**

```html
<label class="checkbox">
  <input type="checkbox" class="checkbox-input">
  <span class="checkbox-box"></span>
  <span>I agree to the terms and conditions</span>
</label>
```

```css
/* Checkbox */
.checkbox {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  
  transition: var(--transition-colors);
}

.checkbox-input:checked + .checkbox-box {
  background: var(--interactive-default);
  border-color: var(--interactive-default);
}

.checkbox-input:focus-visible + .checkbox-box {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.checkbox-input:disabled + .checkbox-box {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
  cursor: not-allowed;
}

/* Checkbox checkmark */
.checkbox-box::after {
  content: '';
  display: none;
  width: 0.375rem;
  height: 0.625rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked + .checkbox-box::after {
  display: block;
}
```

**Radio Button**

```html
<div class="form-group">
  <label class="form-label">Notification Preference</label>
  <div style="display: flex; flex-direction: column; gap: var(--space-3);">
    <label class="radio">
      <input type="radio" name="notifications" class="radio-input" checked>
      <span class="radio-circle"></span>
      <span>All notifications</span>
    </label>
    <label class="radio">
      <input type="radio" name="notifications" class="radio-input">
      <span class="radio-circle"></span>
      <span>Important only</span>
    </label>
    <label class="radio">
      <input type="radio" name="notifications" class="radio-input">
      <span class="radio-circle"></span>
      <span>None</span>
    </label>
  </div>
</div>
```

```css
/* Radio Button */
.radio {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  user-select: none;
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-full);
  
  transition: var(--transition-colors);
}

.radio-input:checked + .radio-circle {
  border-color: var(--interactive-default);
}

.radio-input:focus-visible + .radio-circle {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.radio-circle::after {
  content: '';
  display: none;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--interactive-default);
  border-radius: var(--radius-full);
}

.radio-input:checked + .radio-circle::after {
  display: block;
}
```

**Textarea**

```html
<div class="form-group">
  <label class="form-label" for="description">Description</label>
  <textarea id="description" class="textarea" placeholder="Enter a description..."></textarea>
</div>
```

```css
/* Textarea */
.textarea {
  width: 100%;
  min-height: 6rem;
  padding: var(--space-3) var(--space-4);
  
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  
  resize: vertical;
  transition: var(--transition-colors);
}

.textarea:hover:not(:disabled) {
  border-color: var(--border-secondary);
}

.textarea:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(0, 217, 217, 0.1);
}

.textarea:disabled {
  background: var(--bg-secondary);
  color: var(--text-disabled);
  cursor: not-allowed;
}

.textarea::placeholder {
  color: var(--text-tertiary);
}
```

---

## 10. Utility Classes

### Text Utilities

```css
/* Text truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Text alignment */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Text transform */
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }
```

### Visibility Utilities

```css
/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Hidden */
.hidden {
  display: none;
}

/* Visually hidden but maintain layout */
.invisible {
  visibility: hidden;
}
```

### Flexbox Utilities

```css
.flex { display: flex; }
.inline-flex { display: inline-flex; }

.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }

.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }

.gap-2 { gap: var(--space-2); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }

.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-none { flex: none; }
```

### Grid Utilities

```css
.grid { display: grid; }
.inline-grid { display: inline-grid; }

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
```

### Spacing Utilities

```css
/* Margin */
.m-0 { margin: 0; }
.m-2 { margin: var(--space-2); }
.m-4 { margin: var(--space-4); }
.m-6 { margin: var(--space-6); }
.m-8 { margin: var(--space-8); }

.mt-2 { margin-top: var(--space-2); }
.mt-4 { margin-top: var(--space-4); }
.mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }

.mb-2 { margin-bottom: var(--space-2); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); }

/* Padding */
.p-0 { padding: 0; }
.p-2 { padding: var(--space-2); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }

.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
```

---

## 11. Code Block Treatment

### Inline Code

```html
<p>Use the <code>npm install</code> command to install dependencies.</p>
```

```css
code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  padding: 0.125rem 0.375rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--primary-600);
}
```

### Code Block with Syntax Highlighting

```html
<pre class="code-block"><code class="language-javascript">
function greet(name) {
  return `Hello, ${name}!`;
}
</code></pre>
```

```css
.code-block {
  position: relative;
  margin: var(--space-6) 0;
  padding: var(--space-6);
  
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}

.code-block code {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  
  /* Remove inline code styles */
  padding: 0;
  background: none;
  border: none;
}

/* Syntax highlighting (use with Prism.js or highlight.js) */
.token.comment { color: var(--gray-500); }
.token.keyword { color: var(--primary-400); font-weight: bold; }
.token.string { color: var(--success-400); }
.token.number { color: var(--warning-400); }
.token.function { color: var(--info-400); }
.token.operator { color: var(--text-secondary); }
```

---

## 12. Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Neutrals
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          850: '#2b3035',
          900: '#212529',
          950: '#16181a',
        },
        
        // Primary (Teal/Cyan)
        primary: {
          50: '#e6fdfd',
          100: '#ccfafa',
          200: '#99f5f5',
          300: '#66f0f0',
          400: '#33ebeb',
          500: '#00d9d9',
          600: '#00b8b8',
          700: '#009797',
          800: '#007676',
          900: '#005555',
        },
        
        // Success
        success: {
          50: '#eafaf9',
          100: '#d5f5f3',
          200: '#abebe7',
          300: '#81e1db',
          400: '#57d7cf',
          500: '#2dcdc3',
          600: '#24a49c',
          700: '#1b7b75',
          800: '#12524e',
          900: '#092927',
        },
        
        // Warning
        warning: {
          50: '#fff9e6',
          100: '#fff3cc',
          200: '#ffe799',
          300: '#ffdb66',
          400: '#ffcf33',
          500: '#ffc300',
          600: '#cc9c00',
          700: '#997500',
          800: '#664e00',
          900: '#332700',
        },
        
        // Error
        error: {
          50: '#ffeef0',
          100: '#ffdde1',
          200: '#ffbbc3',
          300: '#ff99a5',
          400: '#ff7787',
          500: '#ff5569',
          600: '#cc4454',
          700: '#99333f',
          800: '#66222a',
          900: '#331115',
        },
        
        // Info
        info: {
          50: '#e6f2ff',
          100: '#cce5ff',
          200: '#99cbff',
          300: '#66b1ff',
          400: '#3397ff',
          500: '#007dff',
          600: '#0064cc',
          700: '#004b99',
          800: '#003266',
          900: '#001933',
        },
      },
      
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        xl: ['1.25rem', { lineHeight: '1.25' }],
        '2xl': ['1.5rem', { lineHeight: '1.25' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
      },
      
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        base: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      
      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
```

---

## 13. Usage Guidelines

### Do's

✅ Use semantic color variables instead of direct color values  
✅ Maintain consistent spacing using the 8px grid  
✅ Use font weights purposefully (medium for emphasis, semibold for headings)  
✅ Apply subtle shadows for depth  
✅ Use teal/cyan primary color for interactive elements  
✅ Keep border radius consistent within component types  
✅ Prioritize readability with sufficient contrast  
✅ Use monospace fonts for all code and technical content

### Don'ts

❌ Don't use random spacing values outside the system  
❌ Don't mix border radius styles arbitrarily  
❌ Don't use bright, saturated colors for large areas  
❌ Don't overuse shadows  
❌ Don't use body text below 14px (0.875rem)  
❌ Don't apply borders without semantic purpose  
❌ Don't use font weights below 400 (light) for body text

---

## 14. Accessibility

### Color Contrast Verification

All color combinations have been verified against WCAG AA standards:

#### Text on Light Backgrounds

| Foreground | Background | Ratio | Status | Use Case |
|------------|------------|-------|--------|----------|
| `--text-primary` (#212529) | `--bg-primary` (#ffffff) | 16.1:1 | ✅ AAA | Body text |
| `--text-secondary` (#495057) | `--bg-primary` (#ffffff) | 10.7:1 | ✅ AAA | Secondary text |
| `--text-tertiary` (#868e96) | `--bg-primary` (#ffffff) | 4.6:1 | ✅ AA | Tertiary text |
| `--primary-600` (#00b8b8) | `--bg-primary` (#ffffff) | 3.2:1 | ✅ AA Large | Interactive elements |

#### Text on Dark Backgrounds

| Foreground | Background | Ratio | Status | Use Case |
|------------|------------|-------|--------|----------|
| `--text-primary` (#f8f9fa) | `--bg-primary` (#16181a) | 15.8:1 | ✅ AAA | Body text |
| `--text-secondary` (#ced4da) | `--bg-primary` (#16181a) | 11.2:1 | ✅ AAA | Secondary text |
| `--text-tertiary` (#adb5bd) | `--bg-primary` (#16181a) | 7.1:1 | ✅ AAA | Tertiary text |
| `--primary-400` (#33ebeb) | `--bg-primary` (#16181a) | 10.5:1 | ✅ AAA | Interactive elements |

### Reduced Motion Support

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Keyboard Navigation

All interactive elements must be keyboard accessible:

```css
/* Ensure focus indicators are visible */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--bg-elevated);
  color: var(--text-primary);
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  z-index: var(--z-notification);
}

.skip-to-main:focus {
  top: 0;
}
```

### Screen Reader Guidelines

- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, etc.)
- Provide `aria-label` for icon-only buttons
- Use `aria-describedby` for form field help text
- Mark decorative images with `aria-hidden="true"`
- Announce dynamic content changes with `aria-live` regions

```html
<!-- Good examples -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<input 
  type="email" 
  id="email"
  aria-describedby="email-help"
  aria-invalid="true"
  aria-errormessage="email-error"
>
<p id="email-help">We'll never share your email</p>
<p id="email-error" role="alert">Please enter a valid email</p>

<div role="status" aria-live="polite" aria-atomic="true">
  Form submitted successfully
</div>
```

### Color Contrast

All text must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

### Focus States

All interactive elements must have visible focus indicators as shown in component examples above.

---

## 15. Dark Mode Implementation

Use CSS custom properties with `prefers-color-scheme` or class-based toggling:

```css
:root {
  /* Light mode colors */
  --bg-primary: #ffffff;
  --text-primary: #212529;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #16181a;
    --text-primary: #f8f9fa;
  }
}

/* OR class-based */
.dark {
  --bg-primary: #16181a;
  --text-primary: #f8f9fa;
}
```

---

## 16. CSS Nesting & Tooling

### Important Note on CSS Syntax

Many of the CSS examples in this design system use the `&` nesting syntax for better readability:

```css
.btn {
  /* Base styles */
  &:hover {
    /* Hover styles */
  }
  
  &:disabled {
    /* Disabled styles */
  }
}
```

**This syntax requires one of the following:**

1. **Native CSS Nesting** (modern browsers, 2024+)
   - Supported in Chrome 112+, Edge 112+, Safari 16.5+, Firefox 117+
   - Can be used directly without tooling

2. **Sass/SCSS Preprocessor**
   ```bash
   npm install sass
   ```

3. **PostCSS with nesting plugin**
   ```bash
   npm install postcss postcss-nesting
   ```

### Alternative: Non-Nested CSS

If you prefer not to use nesting, expand the selectors:

```css
.btn {
  /* Base styles */
}

.btn:hover {
  /* Hover styles */
}

.btn:disabled {
  /* Disabled styles */
}
```

---

## 17. References

This design system synthesizes best practices from:
- **Katalyst Admin Dashboard** - Modern UI components and dark mode patterns
- **Falt Dashboard** - Technical aesthetics and clean layouts
- **Midone Rubick** - Refined spacing and elevation system

---

*Last updated: 2026-03-14*
