# VectorVerify - Page Structure Documentation

## Overview

VectorVerify is a role-aware web application built with Next.js 15 for monthly data quality control of mosquito-surveillance data. The application follows a feature-based organizational structure with clear separation of concerns and scalable architecture.

## Key Features

1. **Authentication** - Role-based access control for Vector Control Officers
2. **Data Review** - Comprehensive review system for KPIs, sessions, specimens, and discrepancy resolution
3. **Image Annotation** - Fast labeling interface for mosquito specimen classification
4. **Export Management** - Reproducible data bundles for Ministry of Health
5. **Administration** - Job monitoring and comprehensive audit trails

## Page Structure Overview

The application is organized using Next.js 15 App Router with feature-based grouping:

```
src/app/
├── layout.tsx                    # Root layout with navigation
├── page.tsx                      # Dashboard (main landing page)
├── auth/                         # Authentication feature
├── review/                       # Data review feature  
├── annotation/                   # Image annotation feature
├── exports/                      # Export management feature
├── admin/                        # Administration feature
└── profile/                      # User profile & settings
```

## Detailed Page Structure

### 1. Authentication Feature (`/auth/`)
- `/auth/login` - Login page with email/password authentication
- `/auth/logout` - Logout handler with redirect

**Purpose**: Secure access control ensuring only authenticated Vector Control Officers can access the system.

### 2. Dashboard (`/`)
**Main landing page** featuring:
- Recent Review Tasks (last 3 with status indicators)
- Recent Annotation Tasks (progress bars and completion status)
- District-Month picker for quick navigation
- Quick links to admin functions

**Navigation**: Central hub connecting all major features

### 3. Data Review Feature (`/review/`)

**Structure**:
- `/review` - List all review tasks with filtering and status
- `/review/[district]/[month]` - Main review page for specific district-month
- `/review/[district]/[month]/kpis` - Key Performance Indicators dashboard
- `/review/[district]/[month]/sessions` - Session data tables and inspection
- `/review/[district]/[month]/specimens` - Specimen classification review
- `/review/[district]/[month]/discrepancies` - Data inconsistency resolution

**Workflow**: Draft → In Review → Approved → Exported (with "Needs Attention" state)

**Features**:
- Workflow status tracking with visual indicators
- Comprehensive KPI metrics and trends
- Data table views with filtering and sorting
- Discrepancy management with assignment and resolution tracking

### 4. Annotation Feature (`/annotation/`)

**Structure**:
- `/annotation` - List all monthly annotation assignments
- `/annotation/[month]` - Monthly assignment overview and progress
- `/annotation/[month]/labeling` - Fast labeling interface

**Features**:
- Progress tracking (typically 50-200 specimens per month)
- Species breakdown and accuracy metrics
- Fast labeling UI with keyboard shortcuts
- Performance statistics and streak tracking

### 5. Export Management Feature (`/exports/`)

**Structure**:
- `/exports` - Export history and status dashboard
- `/exports/[exportId]` - Detailed export information and download

**Features**:
- Export status monitoring (Completed, In Progress, Failed)
- Package content verification
- Digital signature and integrity checking
- Download management for Ministry of Health deliverables

### 6. Administration Feature (`/admin/`)

**Structure**:
- `/admin/jobs` - Real-time job status monitor
- `/admin/changelog` - Complete system audit trail

**Features**:
- Background job monitoring with logs
- Comprehensive change tracking
- System activity audit trail
- Export and filtering capabilities

### 7. Profile & Settings (`/profile/`)
- User profile management
- Permissions and access control display
- Application preferences (theme, notifications, language)
- Security settings and recent activity

## Technical Architecture

### Framework & Tools
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Dark mode support** with system preference detection

### Key Design Principles

1. **Feature-based Organization**: Each major feature has its own directory structure
2. **Dynamic Routing**: Utilizes Next.js dynamic segments for district/month combinations
3. **Scalable Navigation**: Hierarchical navigation with breadcrumbs
4. **Role-based Access**: Structure supports different permission levels
5. **Mobile Responsive**: Tailwind CSS provides responsive design patterns

### URL Structure Examples

```
/                                    # Dashboard
/auth/login                          # Authentication
/review                              # Review task list
/review/nairobi/2024-01             # Specific review
/review/nairobi/2024-01/kpis        # KPI details
/annotation/2024-01                  # Monthly annotation
/annotation/2024-01/labeling        # Fast labeling UI
/exports/EXP-2024-001               # Export details
/admin/jobs                          # Job monitoring
/profile                             # User settings
```

### Data Flow

1. **Authentication** → Dashboard
2. **Dashboard** → Feature selection (Review/Annotation/Export)
3. **Review Process**: List → District/Month → Specific aspect (KPIs/Sessions/Specimens/Discrepancies)
4. **Annotation Process**: List → Monthly assignment → Labeling interface
5. **Export Process**: List → Export details → Download

### State Management

- **URL-based state** for navigation and filtering
- **Local component state** for interactive features (labeling interface)
- **Server-side rendering** for data-heavy pages
- **Client-side interactivity** where needed (fast labeling UI)

## Workflow Integration

The page structure directly supports the VectorVerify workflow:

1. **Data Collection** → Review (KPIs, Sessions, Specimens)
2. **Quality Control** → Discrepancy resolution
3. **Approval** → Workflow state progression  
4. **Annotation** → Monthly specimen classification
5. **Export** → Ministry of Health delivery
6. **Audit** → Complete change tracking

This structure provides a scalable foundation that can accommodate additional districts, months, and feature expansions while maintaining clear organization and intuitive navigation.