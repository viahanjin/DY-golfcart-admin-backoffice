# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit-based golf cart management admin backoffice application with TypeScript, Tailwind CSS, and Vitest for testing. The application manages golf courses, carts, courses, maps, and users in a dashboard interface.

## Common Development Commands

```bash
# Development server
npm run dev              # Start development server (Vite)
npm run dev -- --open    # Start and open in browser

# Build and preview
npm run build           # Build for production
npm run preview         # Preview production build

# Code quality
npm run check           # Run svelte-check for type checking
npm run check:watch     # Run svelte-check in watch mode
npm run lint            # Check code formatting with prettier and ESLint
npm run format          # Auto-format code with prettier

# Testing
npm run test            # Run all tests once
npm run test:unit       # Run unit tests with Vitest

# Storybook
npm run storybook       # Start Storybook dev server
npm run build-storybook # Build Storybook static site
```

## High-Level Architecture

### Tech Stack
- **Framework**: SvelteKit with Svelte 5 (using runes API)
- **Styling**: Tailwind CSS v4 with @tailwindcss/forms
- **Language**: TypeScript
- **Testing**: Vitest with browser mode (Playwright)
- **Component Development**: Storybook
- **Icons**: lucide-svelte

### Project Structure

```
src/
├── routes/              # SvelteKit routes (file-based routing)
│   ├── +layout.svelte   # Root layout with app.css import
│   ├── +page.svelte     # Landing page
│   ├── login/           # Login page with server-side handling
│   └── dashboard/       # Protected dashboard area
│       ├── +layout.svelte  # Dashboard layout with header/sidebar
│       ├── golf-courses/   # Golf course management
│       ├── carts/          # Cart management
│       ├── courses/        # Course management
│       ├── maps/           # Map management
│       └── users/          # User management
│
├── lib/                 # Reusable library code
│   ├── components/      # UI components organized by feature
│   │   ├── layout/      # Header, Sidebar components
│   │   ├── cart/        # Cart-specific modals
│   │   ├── course/      # Course-specific modals
│   │   ├── golf/        # Golf course modals
│   │   ├── map/         # Map-specific modals
│   │   └── ui/          # Generic UI components
│   │
│   ├── constants/       # Application constants
│   │   └── navigation.ts # Menu structure definition
│   │
│   ├── mock/           # Mock JSON data for development
│   │
│   └── utils/          # Utility functions
│       └── map/        # Map processing utilities
│           ├── calculators/    # Bounds and zoom calculations
│           ├── generators/     # File generation (JSON, GeoJSON)
│           ├── loaders/        # Data loading and parsing
│           ├── navigation/     # Route finding algorithms
│           ├── transformers/   # Data format conversions
│           └── validators/     # Connection validation
```

### Key Architectural Patterns

1. **Routing**: File-based routing with nested layouts. Dashboard area has its own layout with persistent sidebar/header.

2. **State Management**: Using Svelte 5 runes (`$props`, `$state`) and stores (`$page`) for reactive state.

3. **Component Structure**: Feature-based organization with dedicated modal components for each entity type (Golf Course, Cart, Course, Map).

4. **Map Utilities**: Comprehensive map data processing system for handling GeoJSON, course data, route finding, and coordinate transformations.

5. **Navigation System**: Hierarchical menu structure defined in `navigation.ts` with support for nested menu items and icons.

6. **Path Aliases**: Configured aliases for cleaner imports:
   - `@/` → `src/`
   - `@components/` → `src/lib/components/`
   - `@constants/` → `src/constants/`

### Dashboard Features

The dashboard provides management interfaces for:
- **Golf Courses**: CRUD operations with location data (lat/lng, RTK support)
- **Carts**: Fleet management with status tracking
- **Courses**: Individual course configuration within golf courses
- **Maps**: Geographic data management with GeoJSON support
- **Users**: User account and permission management

### Testing Strategy

- Client-side tests run in browser environment using Playwright
- Server-side tests run in Node environment
- Test files follow `*.test.ts` or `*.spec.ts` pattern
- Svelte component tests use `*.svelte.test.ts` pattern