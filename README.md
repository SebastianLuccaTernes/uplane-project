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
   cp .env
   ```

   Add your environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   REMOVEBG_API_KEY=your_removebg_api_key_here
   ```

   **Note:** To use the background removal feature, you'll need to:

   - Sign up at [remove.bg](https://www.remove.bg/)
   - Get your API key from the dashboard
   - Add it to your environment variables

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
│   │       ├── route.ts     # General API endpoint
│   │       └── removebg/    # Background removal API
│   │           └── route.ts # Background removal endpoint
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## API Documentation

### Background Removal API

The background removal API allows you to upload image files and receive processed images with transparent backgrounds.

**Endpoint:** `POST /api/removebg`

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `image` field containing the image file

**Response:**

- Success: Returns the processed image as a binary stream with `Content-Type: image/png`
- Error: Returns JSON with error message and appropriate HTTP status code

**Example Usage:**

```javascript
const formData = new FormData();
formData.append("image", imageFile);

const response = await fetch("/api/removebg", {
  method: "POST",
  body: formData,
});

if (response.ok) {
  const blob = await response.blob();
  const processedImageUrl = URL.createObjectURL(blob);
  // Use the processed image
} else {
  const error = await response.json();
  console.error("Error:", error.error);
}
```

**Limitations:**

- Maximum file size: 10MB
- Supported formats: All image types (JPEG, PNG, WebP, etc.)
- Requires `REMOVEBG_API_KEY` environment variable for remove.bg service

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Sebastian Luca Ternes**

- GitHub: [@SebastianLuccaTernes](https://github.com/SebastianLuccaTernes)
