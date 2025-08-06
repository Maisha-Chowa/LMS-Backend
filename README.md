# LMS Backend API

A modern Learning Management System backend built with Express.js, TypeScript, and Prisma.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **User Management**: Role-based access control (Super Admin, Admin, Instructor, Student, Guest)
- **Course Management**: Create, update, and manage courses with modules and lessons
- **Assessment System**: Quizzes and assignments with automated/manual grading
- **Communication**: Discussion forums and messaging system
- **File Management**: Cloudinary integration for file uploads
- **AI Integration**: OpenAI, Claude, and Gemini API support
- **Database**: PostgreSQL with Prisma ORM

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lms-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/lms_db?schema=public"

   # Server
   PORT=5001
   NODE_ENV=development

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_REFRESH_EXPIRES_IN=30d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Or run migrations
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── app/                    # Feature modules
│   ├── auth/              # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── auth.validation.ts
│   ├── user/              # User management
│   ├── course/            # Course management
│   ├── lesson/            # Lesson management
│   ├── enrollment/        # Enrollment system
│   ├── assessment/        # Quizzes and assignments
│   ├── discussion/        # Discussion forums
│   ├── notification/      # Notifications
│   └── analytics/         # Analytics and reporting
├── middleware/            # Global middleware
├── globalErrorHandler/    # Error handling
├── shared/               # Shared utilities
└── config/               # Configuration files
```

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password

### Health Check

- `GET /health` - API health status

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- CORS protection
- Helmet security headers
- Rate limiting (to be implemented)
- SQL injection prevention via Prisma

## 🔧 Development

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

### Database

- Prisma ORM for database operations
- PostgreSQL as the primary database
- Database migrations and seeding

### Testing

- Unit tests (to be implemented)
- Integration tests (to be implemented)
- API tests (to be implemented)

## 🚀 Deployment

### Environment Variables

Make sure to set all required environment variables in production.

### Database

- Use a production PostgreSQL database
- Set up proper database backups
- Configure connection pooling

### Security

- Use strong JWT secrets
- Enable HTTPS
- Set up proper CORS configuration
- Implement rate limiting

## 📝 License

This project is licensed under the ISC License.
