# Design Guidelines: HSC Board Exam Progress Tracker

## Design Approach
**System:** Inspired by Linear's clean productivity interface combined with Notion's dashboard approach and Google Calendar's scheduling patterns. Focus on clarity, efficiency, and reducing cognitive load during high-stress exam preparation.

## Core Design Principles
1. **Information Hierarchy**: Critical data (upcoming exams, today's tasks) always prominent
2. **Calm Interface**: Minimal distractions, generous whitespace, clear visual hierarchy
3. **Scan-ability**: Students should grasp their daily plan in under 3 seconds
4. **Progressive Disclosure**: Show essentials first, details on interaction

## Typography System
- **Headings**: Clean sans-serif (Inter or similar via Google Fonts)
  - H1: Large, bold for page titles
  - H2: Medium weight for section headers
  - H3: Regular weight for subsections
- **Body**: Same family, regular weight for readability
- **Data/Numbers**: Tabular figures for progress percentages and scores
- **Limit**: Single font family with 3 weights (Regular, Medium, Bold)

## Layout & Spacing
**Spacing Scale**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4 or p-6
- Section spacing: mb-6 or mb-8
- Card gaps: gap-4
- Container max-width: max-w-7xl for dashboard, max-w-4xl for focused content

**Grid System**:
- Desktop: 3-column layout for subject cards, 2-column for weekly views
- Tablet: 2-column adaptive
- Mobile: Single column stack

## Page Structure

### Homepage Dashboard
**Layout**: Two-column split (2/3 left, 1/3 right sidebar)
- Left: Current week overview, today's focus tasks, quick stats
- Right: Upcoming exam countdown, subject-wise progress summary, motivational tracker
- No hero section - jump straight to functional dashboard
- Top navigation bar with subject filter tabs

### Day-Wise Schedule
**Calendar Interface**:
- Weekly horizontal timeline as primary view
- Each day as vertical column with time-blocked tasks
- Click day to expand detailed view
- Current day highlighted with subtle border treatment

### Progress Tracker
**Visualization**:
- Horizontal progress bars for each subject (stacked vertically)
- Weekly completion grid (GitHub contribution style)
- Circular progress indicators for overall completion percentage
- Tabular data for detailed breakdowns

## Component Library

### Cards
- Rounded corners (rounded-lg)
- Subtle shadow (shadow-sm)
- Hover lift effect (translate-y minimal)
- Internal padding: p-4 or p-6

### Task Items
- Checkbox + Task title + Subject tag + Time estimate
- Strikethrough on completion
- Compact spacing (gap-2 between elements)

### Subject Tags
- Small pill-shaped badges
- Distinct per subject (achieved through distinct visual treatment, not color)
- Inline with task titles

### Buttons
- Primary: Solid, medium padding (px-6 py-2)
- Secondary: Outline style
- Icon buttons: Circular, p-2

### Forms & Inputs
- Full-width text inputs with border
- Dropdowns for subject selection
- Date/time pickers for scheduling
- Textarea for notes (4-6 rows default)

### Navigation
- Top horizontal navbar: Logo + Subject filters + Profile
- Mobile: Hamburger menu collapsing subject filters

### Data Visualization
- Simple bar charts (CSS-based, no heavy libraries)
- Progress circles using SVG
- Completion grids using CSS Grid

## Interaction Patterns
- Click to expand/collapse task details
- Drag-and-drop for rescheduling (nice-to-have)
- Keyboard shortcuts for power users (a: add task, t: today view)
- Inline editing for task updates

## Responsive Breakpoints
- Mobile: < 640px (stack all columns)
- Tablet: 640px - 1024px (2-column layouts)
- Desktop: > 1024px (full 3-column dashboard)

## Accessibility
- High contrast text ratios
- Focus states on all interactive elements
- ARIA labels for charts and progress indicators
- Keyboard navigation throughout

## Images
**No hero image needed** - this is a utility application focused on functionality. Only use icons from Heroicons (via CDN) for:
- Subject icons (book, calculator, beaker for different subjects)
- Action icons (plus, edit, trash, calendar)
- Status indicators (checkmark, clock, alert)

## Performance Considerations
- Minimize animations (only subtle hover states)
- Lazy load past week data
- Local storage for immediate data persistence
- Progressive enhancement for offline capability