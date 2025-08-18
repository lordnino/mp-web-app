# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MegaPlug EV Charging Station Management Dashboard - An Angular 18-based admin panel for managing electric vehicle charging stations, users, roles, and pricing configurations. Built on the Fuse Angular Admin Template.

## Essential Development Commands

### Development Server
```bash
npm start            # Dev server on http://localhost:4200
npm run start:staging  # Staging configuration
npm run start:prod     # Production configuration
```

### Building
```bash
npm run build          # Production build
npm run build:staging  # Staging build with base href /dev-megaplug-dashboard/
npm run build:prod     # Production build
```

### Testing
```bash
npm test              # Run unit tests via Karma/Jasmine
```

### Deployment
```bash
npm run deploy:staging  # Deploy to staging via SCP
```

## High-Level Architecture

### Module Structure
The application follows Angular's modular architecture with lazy-loaded feature modules:

- **Core Module** (`src/app/core/`): Authentication, guards, navigation, global services
  - `AuthService`: JWT token management and user authentication
  - `RoutePermissionGuard`: Permission-based route protection
  - `NavigationService`: Dynamic navigation based on user permissions

- **Feature Modules** (`src/app/modules/`): Business domain modules
  - Each feature module is self-contained with its own routing, components, and services
  - Lazy-loaded for performance optimization
  - Examples: users, roles, stations, connector-types

- **Shared Module** (`src/app/shared/`): Reusable components and utilities
  - Common UI components, pipes, directives
  - Shared services and utilities

- **Fuse Library** (`src/@fuse/`): Custom UI framework extending Angular Material
  - Theme system, layout components, utilities
  - Custom Material components and configurations

### Authentication & Authorization Flow
1. JWT-based authentication with token stored in localStorage
2. `AuthService` manages login/logout and token lifecycle
3. `RoutePermissionGuard` checks permissions before route activation
4. Navigation items filtered based on user permissions via `NavigationService`
5. API requests authenticated via custom interceptors

### State Management Pattern
- Service-based state using RxJS BehaviorSubjects
- No complex state management library (NgRx/Akita)
- Local storage for persistence of auth tokens and user preferences
- Services expose observables for reactive updates

### API Integration Architecture
- Environment-based configuration in `src/environments/`
- RESTful API communication via Angular HttpClient
- Custom interceptors in `src/app/core/interceptors/`:
  - `query-params.interceptor.ts`: Adds common query parameters
  - Authentication headers added for protected endpoints
- Global error handling via `CustomErrorHandler`

### Component Organization
- Feature components organized by business domain
- Shared components in `src/app/shared/components/`
- Tab-based interfaces for complex views (e.g., station details)
- Dialog-based forms using Angular Material dialogs
- Consistent list/detail/form patterns across modules

### Routing Strategy
- Layout-based routing with multiple layout options (empty, classy, etc.)
- Lazy loading for all feature modules
- Permission-based route guards
- Resolve guards for initial data loading (`InitialDataResolver`)

### Styling Architecture
- Tailwind CSS for utility-first styling
- SCSS for component-specific styles
- Theming via CSS custom properties
- Mobile-first responsive design
- Custom Fuse theme system with multiple color schemes

### Firebase Integration
- Firebase configuration in environment files
- Real-time database capabilities
- FCM for push notifications
- Service worker for PWA features

### Key Services and Their Responsibilities

- **AuthService**: Authentication, token management, user session
- **UserService**: User CRUD operations and profile management
- **StationsService**: Station management and statistics
- **RolesService**: Role and permission management
- **NavigationService**: Dynamic navigation based on permissions
- **NotificationsService**: In-app notifications and alerts
- **ConfirmationService**: Confirmation dialogs for critical actions

### Important Architectural Decisions

1. **Fuse Template Integration**: Leverages professional Angular admin template for consistent UI/UX
2. **Permission-Based Architecture**: All features gated by granular permissions
3. **Service-Oriented State**: Simple service-based state management without complex libraries
4. **Environment-Driven Configuration**: Separate configs for dev, staging, and production
5. **Lazy Loading Strategy**: All feature modules lazy-loaded for performance
6. **Component Reusability**: Shared component library for consistent UI patterns

## Development Guidelines

### Adding New Features
1. Create a new module in `src/app/modules/`
2. Add routing configuration with appropriate guards
3. Implement service for API communication
4. Add permission checks if required
5. Update navigation in `default.ts` if menu item needed

### Working with Permissions
- Permission constants defined in route configurations
- Check permissions using `AuthService.hasPermission()`
- Guard routes with `RoutePermissionGuard`
- Filter UI elements based on user permissions

### API Integration
- Add new endpoints to environment configuration
- Create service methods following existing patterns
- Handle errors consistently using global error handler
- Use interceptors for common request modifications

### Component Development
- Follow existing component patterns for consistency
- Use Fuse components when available
- Implement responsive design using Tailwind utilities
- Handle loading states and errors appropriately