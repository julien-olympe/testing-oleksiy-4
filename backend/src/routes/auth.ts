import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { AuthUtils, TokenBlacklist } from '../utils/auth';
import { validateEmail, validatePassword } from '../utils/validation';
import {
  ValidationError,
  AuthenticationError,
  BusinessLogicError,
  NotFoundError,
} from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config/env';

interface RegisterBody {
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /api/v1/auth/register
  fastify.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    const { email, password } = request.body as RegisterBody;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Required field is missing', {
        field: !email ? 'email' : 'password',
        validationErrors: [
          {
            field: !email ? 'email' : 'password',
            message: `${!email ? 'Email' : 'Password'} is required`,
          },
        ],
      });
    }

    validateEmail(email);
    validatePassword(password);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BusinessLogicError('EMAIL_ALREADY_REGISTERED', 'Email already registered');
    }

    // Hash password and create user
    const passwordHash = await AuthUtils.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = AuthUtils.generateAccessToken(user.id, user.email);
    const refreshToken = AuthUtils.generateRefreshToken(user.id, user.email);

    // Set refresh token cookie
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
      token: accessToken,
      expiresIn: 86400,
    });
  });

  // POST /api/v1/auth/login
  fastify.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { email, password } = request.body as LoginBody;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Required field is missing', {
        field: !email ? 'email' : 'password',
        validationErrors: [
          {
            field: !email ? 'email' : 'password',
            message: `${!email ? 'Email' : 'Password'} is required`,
          },
        ],
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await AuthUtils.comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = AuthUtils.generateAccessToken(user.id, user.email);
    const refreshToken = AuthUtils.generateRefreshToken(user.id, user.email);

    // Set refresh token cookie
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    reply.send({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
      token: accessToken,
      expiresIn: 86400,
    });
  });

  // POST /api/v1/auth/logout
  fastify.post(
    '/logout',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        TokenBlacklist.add(token);
      }

      // Clear refresh token cookie
      reply.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      reply.send({ message: 'Logged out successfully' });
    }
  );

  // POST /api/v1/auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required');
    }

    try {
      const payload = AuthUtils.verifyRefreshToken(refreshToken);

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Generate new access token
      const accessToken = AuthUtils.generateAccessToken(user.id, user.email);

      // If refresh token expires within 24 hours, issue new refresh token
      let newRefreshToken: string | undefined;
      if (AuthUtils.isTokenExpiringSoon(refreshToken, 24)) {
        newRefreshToken = AuthUtils.generateRefreshToken(user.id, user.email);
        reply.setCookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: config.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }

      reply.send({
        token: accessToken,
        expiresIn: 86400,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Token expired' || error.message === 'Invalid token') {
          throw new AuthenticationError('Invalid or expired refresh token', 'INVALID_TOKEN');
        }
      }
      throw error;
    }
  });
}
