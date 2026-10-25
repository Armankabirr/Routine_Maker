# 🎓 UIU Fall 2026 Routine Planner & Pre-Registration Worksheet

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![University](https://img.shields.io/badge/UIU-United_International_University-ea580c)](https://www.uiu.ac.bd/)

> An interactive, clash-free routine planner and pre-registration worksheet built for **United International University (UIU)** students for the **Fall 2026** trimester.

---

### 👨‍💻 Developer Information
* **Developer:** Arman Kabir
* **Student ID:** `0112230478`
* **Department:** Computer Science and Engineering (CSE) / Data Science (DS)
* **Institution:** United International University (UIU)

---

## 📌 Overview

Pre-registration and course routine planning can be stressful, with scattered schedules, conflicting time slots, and section overlaps. The **UIU Fall 2026 Routine Planner** transforms this into an effortless, intuitive, and modern experience inspired by tools like Notion, Linear, and Google Calendar.

### Guided Workflow
1. **Explore & Search:** Search by course code (e.g., `CSE 4157`), course title, or filter by category (`Core`, `Elective`, `Theory`, `Lab`).
2. **Add Courses:** Add desired courses to your planner. Added courses move smoothly into your "Selected Courses" accordion.
3. **Choose Sections (Toggleable):** Expand any course to view all available sections with faculty details, room numbers, and schedule slots. Click **○ Select** to assign a section; click **✓ Selected** again to deselect.
4. **Live Timetable Preview:** As sections are selected, the sticky weekly calendar updates immediately.
5. **Instant Clash Detection:** Any overlapping lecture or lab slots are instantly highlighted in red with actionable conflict notices.
6. **Export as PDF:** Generate a print-ready vector PDF routine with your student credentials in a single click.

---

## ✨ Key Features

### 🔍 1. Course Explorer & Intelligent Filtering
- Real-time search across course codes (`CSE 1111`, `CSE 4157`, `MAT 2141`), course titles, and faculty codes.
- Fast category chips: `All`, `Core`, `Elective`, `Theory`, `Lab`.
- Quick-filter chips for morning vs. afternoon sessions.
- Interactive course cards displaying credit counts, available sections, and prerequisite information.

### 📋 2. Selected Courses Accordion & Toggle Selection
- Accordion design: Expand one course at a time to keep the workspace clean and clutter-free.
- **Modern Toggle Button**:
  - Click **Select** to activate a section.
  - Click **Selected** again to deselect, instantly clearing the slot from the calendar.
- **One Section Per Course**: Automatically replaces prior section selections without friction.
- Progress bar displaying selected courses and confirmed sections (e.g., `Courses Selected: 4 / 5`, `Sections Selected: 4 / 4`).

### 📅 3. Compact Google Calendar-Style Weekly Timetable
- **Sticky Side Panel**: Stays pinned in view while you browse courses on desktop.
- **Internal Scroll Container**: Compact height designed to comfortably fit standard 1080p and laptop viewports without scrolling the entire page.
- **Compact Time Grid**: Saturday through Wednesday columns with standard UIU class periods (8:30 AM to 4:30 PM).
- **Color-Coded Badges**: Distinct pastel hues for each course, displaying course code, section, faculty abbreviation, and room number.
- **Empty State Illustration**: Welcoming prompt when starting fresh.

### ⚠️ 4. Real-Time Conflict & Clash Engine
- Detects overlapping class times across Saturday, Sunday, Monday, Tuesday, and Wednesday.
- Displays a clean top alert badge (e.g., `⚠ 1 Schedule Conflict Detected`) instead of intrusive popups.
- Highlights colliding events directly on the calendar grid for quick diagnosis and resolution.

### 📄 5. Single-Click Vector PDF Export
- Engineered with `jsPDF` and `jspdf-autotable` to produce crisp, publication-quality vector PDFs.
- Bypasses DOM canvas rendering bugs (including CSS `oklch` color issues).
- Generates a formatted document containing:
  - Official UIU header with semester metadata (Fall 2026).
  - Student Details: Name (**Arman Kabir**), Student ID (**0112230478**).
  - Summary table of enrolled courses, sections, credits, and faculty.
  - Formatted day-by-day weekly timetable grid.

### 🌓 6. Dark Mode & Light Mode
- Fully functional theme toggle with dark slate palette and high-contrast typography.
- Uses modern Tailwind CSS v4 selector variants (`.dark`).
- Persists user preference via `localStorage` and respects system color scheme defaults.

### 📱 7. Responsive Mobile Layout
- Seamless layout adaptation for smartphones and tablets.
- Sticky bottom navigation bar allowing 1-tap switching between **Courses Explorer** and **Weekly Routine**.
- Floating badge showing active courses and credits.
- Day-selector tabs for easy single-day routine checking on smaller screens.

### 👨‍🏫 8. Faculty Directory
- Searchable directory of UIU faculty members with designations, departments, emails, and list of all sections assigned in Fall 2026.

### 📂 9. Custom Routine PDF Parser
- Upload updated UIU routine PDF documents or custom JSON datasets to keep class schedules in sync with official registrar releases.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | [React 19](https://react.dev/) | Functional components, modern hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe models, props, and schedules |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Ultra-fast HMR and optimized bundler |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS `@custom-variant dark` styling |
| **Icons** | [Lucide React](https://lucide.dev/) | Crisp, lightweight icons |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) + [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Native vector PDF rendering |
| **PDF Parsing** | [pdfjs-dist](https://github.com/mozilla/pdf.js) | Client-side routine PDF extraction |

---

## 📂 Project Structure

```text
├── .aistudio/                  # AI Studio configuration and artifacts
├── public/                     # Static assets and icons
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ConflictAlert.tsx            # Conflict detection alert banner
│   │   ├── CourseCard.tsx               # Interactive course card for explorer
│   │   ├── CourseExplorer.tsx           # Search, category chips & browse list
│   │   ├── ExportModal.tsx              # Vector PDF exporter with student ID
│   │   ├── FacultySearch.tsx            # Faculty directory lookup
│   │   ├── FilterBar.tsx                # Filter chips (Core, Elective, Theory, Lab)
│   │   ├── Header.tsx                   # Top navigation bar with theme toggle & PDF export
│   │   ├── PlanningProgressBar.tsx      # Credit & section selection progress bar
│   │   ├── SectionTable.tsx             # Section list with toggleable selection
│   │   ├── SelectedCoursesAccordion.tsx # Accordion for active courses & sections
│   │   ├── StatisticsPanel.tsx          # Total credits, busy days, and conflicts summary
│   │   ├── UploadModal.tsx              # Routine PDF uploader & parser
│   │   └── WeeklyCalendar.tsx           # Sticky compact Google Calendar-style grid
│   ├── data/
│   │   └── routineData.json             # Pre-loaded UIU Fall 2026 course schedule
│   ├── types/
│   │   └── index.ts                     # TypeScript interfaces (Course, Section, TimeSlot)
│   ├── utils/
│   │   └── routineUtils.ts              # Clash detection, time parser, & PDF export engine
│   ├── App.tsx                          # Root application container & mobile view manager
│   ├── index.css                        # Tailwind v4 configuration & theme custom variants
│   └── main.tsx                         # React entry point
├── metadata.json               # Application metadata
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite configuration with Tailwind CSS plugin
```

---

## 🕒 UIU Standard Class Schedule Slots

The application is calibrated to the official UIU class slot timings:

### Theory Slots (Sunday / Tuesday / Wednesday / Saturday)
* **Slot 1:** 08:30 AM – 09:50 AM
* **Slot 2:** 09:51 AM – 11:10 AM
* **Slot 3:** 11:11 AM – 12:30 PM
* **Slot 4:** 12:31 PM – 01:50 PM
* **Slot 5:** 01:51 PM – 03:10 PM
* **Slot 6:** 03:11 PM – 04:30 PM

### Laboratory Slots (2-Hour Blocks)
* **Lab 1:** 08:30 AM – 10:30 AM
* **Lab 2:** 10:31 AM – 12:30 PM
* **Lab 3:** 01:00 PM – 03:00 PM
* **Lab 4:** 03:01 PM – 05:00 PM

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version `18.0` or higher)
- [npm](https://www.npmjs.com/) (version `9.0` or higher)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/uiu-routine-planner.git
cd uiu-routine-planner
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development server
```bash
npm run dev
```
The app will be accessible at: `http://localhost:3000`

### 4. Build for production
```bash
npm run build
```
The production bundle will be created inside the `dist/` directory.

### 5. Type-check & Lint
```bash
npm run lint
```
live: routine-maker-delta.vercel.app
---

## 📖 Step-by-Step Usage Guide

1. **Open the Planner**: On first launch, the course planner displays the available UIU Fall 2026 courses on the left and an empty timetable preview on the right.
2. **Find Your Courses**: Type in the search bar (e.g. `Algorithms` or `CSE 2215`). Use the category chips to filter by `Core` or `Elective`.
3. **Add Course**: Click **➕ Add Course**. The card transitions into the **Selected Courses** list.
4. **Select Section**: Expand the course card accordion in the Selected Courses section. Browse section times and faculties. Click **○ Select** on your preferred section. The button turns green (**✓ Selected**) and the class is instantly plotted on the weekly routine.
5. **Deselect or Switch**: Click **✓ Selected** to remove the section, or click **○ Select** on another section to automatically replace it.
6. **Check for Clashes**: Look at the conflict status badge at the top of the routine. If two classes overlap, a warning appears and conflicting blocks are highlighted in red.
7. **Export Routine**: Click **📄 Export as PDF** in the top navigation bar. Enter or confirm your student details (**Arman Kabir**, ID: **0112230478**) and click **Download PDF**.

---

## 📜 License & Credits

Developed with ❤️ by **Arman Kabir** (ID: `0112230478`) for the student community of **United International University**.

*All course schedules and curriculum details belong to United International University (UIU).*
