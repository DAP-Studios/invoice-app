# UI/UX Quick Reference Guide

## 🎨 Design System Overview

### Colors

```css
Primary   #1a73e8  (Blue)
Success   #4caf50  (Green)
Warning   #ff9800  (Orange)
Danger    #f44336  (Red)
Info      #2196f3  (Light Blue)
```

### Spacing Scale

```
xs: 0.25rem (4px)
sm: 0.5rem  (8px)
md: 1rem    (16px)
lg: 1.5rem  (24px)
xl: 2rem    (32px)
2xl: 3rem   (48px)
```

### Typography Scale

```
Display: clamp(1.75rem, 5vw, 2.5rem)
H1:      clamp(1.5rem, 4vw, 2rem)
H2:      clamp(1.25rem, 3vw, 1.5rem)
Body:    16px
Small:   14px
```

---

## 🎬 Animation Library

### Page Load

```css
animation: fadeIn 0.5s ease-out;
animation: slideDown 0.6s ease-out;
animation: slideUp 0.6s ease-out;
```

### Interactive

```css
/* Hover effects */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Staggered animations */
animation-delay: 0.1s; /* for nth-child */

/* Loading state */
animation: spin 1s linear infinite;
animation: pulse 2s ease-in-out infinite;
```

### Timing Functions

- **Fast**: 150ms
- **Base**: 300ms (default)
- **Slow**: 500ms
- **xSlow**: 600ms

---

## 📱 Responsive Breakpoints

### Mobile First

```css
/* Mobile (320px+) - Default styles */
.card {
  padding: 0.75rem;
  grid-template-columns: 1fr;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .card {
    padding: 2rem;
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 🔘 Button Patterns

### Basic Button

```jsx
<button className="btn btn-primary">Click Me</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-danger">Delete</button>
```

### Button Sizes

```jsx
<button className="btn btn-sm">Small</button>      {/* 44px height */}
<button className="btn">Default</button>            {/* 44px height */}
<button className="btn btn-lg">Large</button>       {/* 48px height */}
<button className="btn btn-block">Full Width</button>
```

### Button States

```jsx
<button className="btn" disabled>Disabled</button>
<button className="btn loading">Loading...</button>
<button className="btn btn-icon">🔍</button>
```

---

## 💳 Card Patterns

### Basic Card

```jsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>
```

### Stat Card

```jsx
<div className="stat-card success">
  <h3>Total Revenue</h3>
  <div className="value">$12,000</div>
  <p className="subtext">+15% from last month</p>
</div>
```

### Card Variants

```jsx
<div className="stat-card">Default</div>
<div className="stat-card success">Success</div>
<div className="stat-card warning">Warning</div>
<div className="stat-card danger">Danger</div>
```

---

## 📊 Grid Layouts

### Responsive Grid

```css
/* Auto-fit: responsive without media queries */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
gap: clamp(1rem, 4vw, 1.5rem);
```

### Two Column Grid

```css
grid-template-columns: repeat(2, 1fr);

@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

### Four Column Grid

```css
grid-template-columns: repeat(4, 1fr);

@media (max-width: 1024px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

---

## 🎯 Common Patterns

### Card Hover Effect

```css
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}
```

### Button Hover Effect

```css
button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1557b0 0%, #0d3f8f 100%);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.35);
  transform: translateY(-2px);
}
```

### Table Row Hover

```css
.data-table tbody tr:hover {
  background: linear-gradient(90deg, #f9f9f9, #f5f5f5);
  box-shadow: inset 3px 0 0 #1a73e8;
}
```

### Status Badge

```css
.status-badge.pending {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #e65100;
  border-color: #ffb74d;
}

.status-badge.pending::before {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 🎞️ Animation Examples

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.element {
  animation: fadeIn 0.5s ease-out;
}
```

### Slide Up (Staggered)

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.report-section {
  animation: slideUp 0.6s ease-out;
}
.report-section:nth-child(2) {
  animation-delay: 0.1s;
}
.report-section:nth-child(3) {
  animation-delay: 0.2s;
}
```

### Pulse

```css
@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 2px;
  }
  50% {
    box-shadow: 0 0 8px;
  }
}

.status-badge {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 📐 Using Clamp()

### Responsive Spacing

```css
/* Scales between 1rem and 2rem based on viewport */
padding: clamp(1rem, 4vw, 2rem);
margin: clamp(1rem, 5vw, 3rem);
gap: clamp(0.5rem, 2vw, 1.5rem);
```

### Responsive Typography

```css
font-size: clamp(0.875rem, 2vw, 1.1rem);
h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}
h2 {
  font-size: clamp(1.25rem, 4vw, 2rem);
}
```

### Responsive Width

```css
max-width: clamp(100%, 90%, 1400px);
width: clamp(100%, 80%, 400px);
```

---

## 📋 Form Elements

### Input Focus State

```css
input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}
```

### Editable Form (Invoice)

```css
.editable-input {
  border: 1px dashed transparent;
  background: transparent;
  transition: all 0.2s ease;
}

.editable-input:hover {
  background: #f5f5f5;
  border: 1px dashed #ccc;
}

.editable-input:focus {
  border: 1px solid #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
}
```

---

## 🔍 Table Patterns

### Sticky Header

```css
.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

### Responsive Table

```css
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth on iOS */
}

@media (max-width: 768px) {
  .data-table {
    font-size: 0.8rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.6rem;
  }
}
```

---

## 🚀 Performance Tips

### GPU Acceleration

```css
/* Use these for animations */
transform: translateY(-4px);
transform: scale(1.05);
opacity: 0.5;

/* Avoid these */
/* top, left, width, height - cause reflow */
```

### Hardware Hints

```css
.animated-element {
  will-change: transform, opacity;
}

/* Remove will-change when not animating */
```

---

## ♿ Accessibility Checklist

- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states are visible (outline or glow)
- [ ] Keyboard navigation works
- [ ] No element with only color as indicator
- [ ] Icons have text labels or aria-labels
- [ ] Form inputs have associated labels
- [ ] Animations respect prefers-reduced-motion

---

## 📱 Mobile Touch Optimization

### Touch Target Size

```css
/* Minimum 44px × 44px for touch */
button,
.btn {
  min-height: 44px;
  min-width: 44px;
}
```

### Touch Spacing

```css
/* Minimum 8px between touch targets */
button + button {
  margin-left: 0.5rem; /* 8px */
}
```

### Touch Feedback

```css
button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}
```

---

## 🎨 CSS Variables Usage

### Define Variables

```css
:root {
  --primary: #1a73e8;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Use Variables

```css
.button {
  color: var(--primary);
  transition: var(--transition);
  box-shadow: var(--shadow-md);
}
```

### Override Variables

```css
.button.success {
  --primary: #4caf50;
}
```

---

## 🧪 Testing Responsive Design

### Browser DevTools

1. Open DevTools (F12)
2. Click responsive mode (Ctrl+Shift+M)
3. Test at these widths:
   - 375px (Mobile)
   - 768px (Tablet)
   - 1024px (Desktop)
   - 1440px (Large Desktop)

### Common Issues to Check

- [ ] Text is readable (no overlapping)
- [ ] Buttons are touchable (44px minimum)
- [ ] Images scale properly
- [ ] Horizontal scroll only when needed
- [ ] Animations are smooth (60 FPS)
- [ ] Tables are scrollable on mobile
- [ ] Forms are easy to use

---

## 🐛 Debugging Tips

### Animation Not Working

```css
/* Check animation syntax */
animation: fadeIn 0.5s ease-out;
/* vs incorrect */
animation: fadeIn; /* Missing duration */
```

### Responsive Not Scaling

```css
/* Use clamp() instead of fixed sizes */
padding: clamp(1rem, 4vw, 2rem); /* Good */
padding: 1.5rem; /* Bad - fixed */
```

### Button Hover Effect Missing

```css
/* Ensure button has transition */
button {
  transition: all 0.3s ease; /* Required */
}

button:hover {
  /* Your hover styles */
}
```

---

## 🎯 Next Steps

### To Add New Features

1. Follow the existing color system
2. Use clamp() for responsive sizing
3. Add appropriate hover states
4. Test on mobile devices
5. Ensure animation performance

### To Modify Existing Components

1. Check CSS Variables first
2. Use existing animation keyframes
3. Respect responsive breakpoints
4. Maintain touch-friendly sizes
5. Test accessibility

---

## Quick Links

- Global Styles: `src/styles/global.css`
- Reports: `src/pages/Reports.css`
- Payments: `src/pages/Payments.css`
- Buttons: `src/components/Button.css`
- Cards: `src/components/Card.css`
- Tables: `src/components/Table.css`
- Forms: `src/pages/CreateInvoice.css`

---

**Last Updated**: Phase 2 UI/UX Enhancement
**Version**: 2.0
**Status**: ✅ Production Ready
