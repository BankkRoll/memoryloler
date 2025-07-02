# MemoryLoler

A modern, production-grade web application for searching historical Twitter username data using the Memory.lol API. Built with Next.js 14, TypeScript, and Tailwind CSS.

![MemoryLoler](https://github.com/user-attachments/assets/d8089104-d163-4fc7-b731-3100e15b6fc7)

## Features

- **Historical Username Search**: Look up past usernames for Twitter accounts using Memory.lol's comprehensive database
- **GitHub Authentication**: Secure OAuth integration for full access to 12 years of historical data
- **Real-time Search**: Instant results with proper error handling and user feedback
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS and shadcn/ui
- **Access Control**: Clear distinction between limited (60-day) and full access
- **Professional UI**: Clean, intuitive interface with proper loading states and error handling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: GitHub OAuth Device Flow
- **API**: Memory.lol REST API
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/github/route.ts    # GitHub OAuth endpoints
│   │   └── search/route.ts         # Memory.lol search API
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Main application page
│   └── error.tsx                   # Error boundaries
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── header.tsx                  # Application header
│   ├── footer.tsx                  # Application footer
│   └── auth-modal.tsx              # GitHub authentication modal
├── hooks/                          # Custom React hooks
├── lib/                            # Utility functions
└── providers/                      # React context providers
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- GitHub account (for full access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BankkRoll/memoryloler.git
   cd memoryloler
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Authentication

### Public Access
- Limited to data from the past 60 days
- No authentication required
- Suitable for basic username lookups

### Full Access
- Access to 12 years of historical data
- Requires GitHub authentication
- Manual approval by Memory.lol admin required
- Available for researchers, journalists, and activists

### Getting Full Access
1. Click "Get Full Access" in the header
2. Complete GitHub device flow authentication
3. Contact Memory.lol admin for approval
4. Once approved, you'll have access to the full historical index

## Usage

### Basic Search
1. Enter one or more Twitter usernames (comma-separated)
2. Click "Search" or press Enter
3. View results showing historical usernames and dates

### Example Queries
- `libsoftiktok` - Popular account with username history
- `elonmusk` - High-profile account
- `twitter,github` - Multiple accounts at once

### Understanding Results
- **Account ID**: Unique Twitter account identifier
- **Screen Names**: Historical usernames used by the account
- **Dates**: When each username was observed
- **Current**: The most recent username

## API Endpoints

### Search API
- `GET /api/search?usernames=<usernames>&platform=twitter&token=<token>`
- `POST /api/search` (with JSON body)

### Authentication API
- `POST /api/auth/github` - Initiate GitHub device flow
- `GET /api/auth/github?device_code=<code>` - Complete authentication

## Customization

### Styling
The app uses Tailwind CSS with a custom design system. Modify `src/app/globals.css` for global styles.

### Components
All UI components are built with shadcn/ui and can be customized in `src/components/ui/`.

### Configuration
- Update metadata in `src/app/layout.tsx`
- Modify API endpoints in `src/app/api/`
- Customize authentication flow in `src/components/auth-modal.tsx`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Memory.lol**: The underlying data service providing historical Twitter account information
- **Travis Brown**: Creator of Memory.lol and the comprehensive dataset
- **shadcn/ui**: Beautiful, accessible UI components
- **Vercel**: Next.js framework and deployment platform

---

Built by [bankkroll.eth](https://twitter.com/bankkroll_eth)
