# Wedding Landing Page

A beautiful, modern wedding invitation and RSVP system built with Next.js 15, Supabase, and Tailwind CSS.

## 🚀 Features

- **Beautiful Invitation System**: Multi-step RSVP process with elegant design
- **Gallery Management**: Upload and organize wedding photos
- **Dashboard**: Admin panel for managing events, RSVPs, and guests
- **Authentication**: Secure user authentication with Supabase
- **Image Storage**: Bunny.net integration for fast image delivery
- **Responsive Design**: Mobile-first design that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Image Storage**: Bunny.net
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Bunny.net account (for image storage)

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/wedding-landing-page.git
   cd wedding-landing-page
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env-example.txt .env.local
   ```

   Fill in your environment variables:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Bunny.net Configuration (for image storage)
   BUNNY_NET_STORAGE_API_KEY=your-bunny-net-key
   BUNNY_NET_STORAGE_ZONE_NAME=wedding-app-storage
   BUNNY_NET_CDN_URL=https://your-cdn-url.b-cdn.net
   BUNNY_NET_STORAGE_ZONE=your-storage-zone
   BUNNY_NET_STORAGE_ENDPOINT=https://storage.bunnycdn.com
   ```

4. **Set up Supabase**

   - Create a new Supabase project
   - Run the SQL schema from `SUPABASE_SETUP.md`
   - Copy your project credentials to `.env.local`

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/wedding-landing-page.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard
   - Deploy!

### Option 2: Deploy from CLI

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Set environment variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # Add other required environment variables
   ```

## 🔧 Environment Variables

| Variable                        | Description                 | Required |
| ------------------------------- | --------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL   | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key      | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key   | Yes      |
| `BUNNY_NET_STORAGE_API_KEY`     | Bunny.net storage API key   | Yes      |
| `BUNNY_NET_STORAGE_ZONE_NAME`   | Bunny.net storage zone name | Yes      |
| `BUNNY_NET_CDN_URL`             | Bunny.net CDN URL           | Yes      |
| `BUNNY_NET_STORAGE_ZONE`        | Bunny.net storage zone      | Yes      |
| `BUNNY_NET_STORAGE_ENDPOINT`    | Bunny.net storage endpoint  | Yes      |

## 📁 Project Structure

```
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/                    # Utility functions and configurations
├── public/                 # Static assets
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## 🗄️ Database Schema

The application uses the following main tables:

- `user_profiles` - User information and roles
- `events` - Wedding event details
- `invitation_rsvps` - RSVP responses
- `gallery_albums` - Photo album organization
- `gallery_images` - Individual photos

Run the SQL from `SUPABASE_SETUP.md` to set up your database.

## 🔐 Authentication

The app uses Supabase Auth with role-based access:

- **Super Admin**: Full access to all features
- **Organizer**: Event management and RSVPs
- **Guest**: RSVP functionality only

## 📸 Gallery Features

- Upload photos to Bunny.net storage
- Organize photos in albums
- Public and private galleries
- QR code generation for easy sharing

## 🎨 Customization

The design uses Tailwind CSS with custom color schemes. Main colors:

- Primary: `#E5B574` (Gold)
- Secondary: `#C18037` (Brown)
- Accent: `#08080A` (Black)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section in `MIGRATION_GUIDE.md`
2. Review Supabase and Vercel documentation
3. Check browser console for errors

---

Built with ❤️ for beautiful weddings
