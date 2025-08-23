# UpLane Project

A full-stack TypeScript application showcasing modern web development skills with advanced image processing capabilities.

## Project Overview

This project demonstrates a complete image processing pipeline that allows users to upload images, automatically remove backgrounds, and apply horizontal flipping transformations. The application is built with modern web technologies and follows best practices for scalable web development.

**Key Features:**

- Image upload and processing
- Automatic background removal
- Image transformation (horizontal flipping)
- Real-time processing feedback
- Responsive design
- Secure file handling

## Tech Stack

### Frontend

- **React 19** - Latest React with concurrent features
- **Next.js 15** - Full-stack React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Next.js API Routes** - Serverless API endpoints

### Development Tools

- **ESLint** - Code linting and formatting
- **Turbopack** - Fast bundler for development
- **PostCSS** - CSS processing

## Installation Guide

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Git

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/SebastianLuccaTernes/All-In-Tracker.git
   cd uplane-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Add your environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
uplane-project/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── globals.css      # Global styles
│   │   └── api/             # API routes
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Sebastian Luca Ternes**

- GitHub: [@SebastianLuccaTernes](https://github.com/SebastianLuccaTernes)
