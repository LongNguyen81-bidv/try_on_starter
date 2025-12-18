import bcrypt from 'bcryptjs';
import { findProfileByEmail, createProfile } from '../repositories/profile_repository.js';
import { generateToken } from '../utils/jwt.js';
import { HTTP_STATUS } from '../config/constants.js';

const SALT_ROUNDS = 10;

export const registerUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingProfile = await findProfileByEmail(normalizedEmail);
  if (existingProfile) {
    const error = new Error('Email đã được sử dụng');
    error.statusCode = HTTP_STATUS.CONFLICT;
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const profileData = {
    email: normalizedEmail,
    password_hash: passwordHash,
  };

  const newProfile = await createProfile(profileData);

  return {
    id: newProfile.id,
    email: newProfile.email,
    full_name: newProfile.full_name,
    created_at: newProfile.created_at,
  };
};

export const loginUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  const profile = await findProfileByEmail(normalizedEmail);
  if (!profile) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, profile.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = generateToken({
    id: profile.id,
    email: profile.email,
    role: profile.role || 'user',
  });

  return {
    token,
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role || 'user',
    },
  };
};

