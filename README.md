# VectorVerify

VectorVerify is a role-aware web application for monthly data quality control of mosquito-surveillance data. Built with Next.js 15, it provides Master Vector Control Officers (VCOs) with comprehensive tools to review KPIs, inspect data tables, resolve discrepancies, approve clean snapshots, and complete monthly image-annotation assignments.

## 🎯 Key Features

### Data Review & Quality Control
- **District-Month Review**: Open any district and month to review KPIs and data quality
- **Session/Specimen Inspection**: Detailed tables for collection data analysis
- **Discrepancy Resolution**: Identify and resolve data inconsistencies
- **Workflow Management**: Clear progression from Draft → In Review → Approved → Exported
- **Approval System**: Approve clean data snapshots for export

### Image Annotation
- **Monthly Assignments**: Complete 50-200 specimen classifications per month
- **Fast Labeling UI**: Keyboard shortcuts and streamlined interface for rapid annotation
- **Species Classification**: Identify mosquito species with confidence scoring
- **Progress Tracking**: Monitor completion rates and accuracy metrics

### Export & Reporting
- **Ministry of Health Exports**: Generate reproducible data bundles
- **Job Status Monitoring**: Track export progress and completion
- **Audit Trail**: Complete changelog of all system activities
- **Data Integrity**: Checksums and digital signatures for exported packages

### Administration
- **Role-based Access**: Master VCOs can access any district/month
- **System Monitoring**: Real-time job status and performance metrics
- **Comprehensive Logging**: Full audit trail of data changes and user actions

## 🏗️ Architecture

### Framework
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **React** for interactive components

### Page Structure
```
src/app/
├── layout.tsx                          # Root layout
├── page.tsx                            # Dashboard
├── auth/                               # Authentication
│   ├── login/page.tsx
│   └── logout/page.tsx
├── review/                             # Data Review
│   ├── page.tsx                        # Review tasks list
│   └── [district]/[month]/
│       ├── page.tsx                    # Review overview
│       ├── kpis/page.tsx               # KPI dashboard
│       ├── sessions/page.tsx           # Session data
│       ├── specimens/page.tsx          # Specimen data
│       └── discrepancies/page.tsx      # Issue resolution
├── annotation/                         # Image Annotation
│   ├── page.tsx                        # Assignment list
│   └── [month]/
│       ├── page.tsx                    # Monthly overview
│       └── labeling/page.tsx           # Fast labeling UI
├── exports/                            # Export Management
│   ├── page.tsx                        # Export history
│   └── [exportId]/page.tsx             # Export details
├── admin/                              # Administration
│   ├── jobs/page.tsx                   # Job monitoring
│   └── changelog/page.tsx              # Audit trail
└── profile/page.tsx                    # User settings
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vci-developers/vector-verify.git
   cd vector-verify
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
yarn build

# Start production server
yarn start
```

## 📱 User Interface

### Dashboard
The main dashboard provides:
- Recent Review Tasks with status indicators
- Recent Annotation Tasks with progress tracking
- Quick access district-month picker
- Navigation to all major features

### Data Review Interface
- **KPI Dashboard**: Metrics, trends, and quality indicators
- **Data Tables**: Filterable and sortable session/specimen data
- **Discrepancy Management**: Issue tracking and resolution
- **Workflow Status**: Visual progress through approval stages

### Fast Labeling Interface
- **Keyboard Shortcuts**: Numbers 1-8 for species selection
- **Navigation**: Arrow keys for specimen browsing
- **Confidence Scoring**: Adjustable confidence levels
- **Progress Tracking**: Real-time completion status

### Export Management
- **Status Monitoring**: Track export job progress
- **Package Details**: Content verification and download
- **Integrity Checking**: Checksums and digital signatures
- **Audit Trail**: Complete export history

## 🔐 Security & Authentication

- **Role-based Access Control**: Only authenticated VCOs can access features
- **Session Management**: Secure login/logout handling
- **Data Integrity**: Cryptographic checksums for exports
- **Audit Logging**: Complete record of all system activities

## 📊 Data Workflow

1. **Collection**: Mosquito surveillance data collection in field
2. **Import**: Data imported into VectorVerify system
3. **Review**: VCOs review KPIs, sessions, and specimens
4. **Quality Control**: Discrepancies identified and resolved
5. **Annotation**: Monthly specimen classification assignments
6. **Approval**: Clean data snapshots approved for export
7. **Export**: Reproducible bundles delivered to Ministry of Health
8. **Audit**: Complete changelog maintained for accountability

## 🛠️ Development

### Code Structure
- **Feature-based Organization**: Each major feature in its own directory
- **TypeScript**: Full type safety with strict configuration
- **Component Reusability**: Shared UI components across features
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Key Design Principles
- **Scalability**: Easy to add new districts, months, and features
- **Intuitive Navigation**: Clear hierarchy and breadcrumb navigation
- **Performance**: Server-side rendering for data-heavy pages
- **Accessibility**: WCAG compliance with semantic HTML

### Scripts
```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

## 📝 Documentation

- [Page Structure Guide](docs/PAGE_STRUCTURE.md) - Detailed page organization
- [API Documentation](docs/API.md) - Backend integration points
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 Acknowledgments

- Ministry of Health for surveillance data requirements
- Vector Control Officers for field testing and feedback
- Public Health Institute for domain expertise

---

**VectorVerify** - Ensuring data quality in mosquito surveillance for public health protection.
