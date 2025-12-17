import { findProfileById, updateProfile } from '../repositories/profile_repository.js';
import { supabase } from '../config/database.js';
import { HTTP_STATUS } from '../config/constants.js';

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const getUserProfile = async (userId) => {
  const profile = await findProfileById(userId);

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    height: profile.height,
    weight: profile.weight,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
};

export const updateUserProfile = async (userId, updateData) => {
  const updatePayload = {};

  if (updateData.full_name !== undefined) {
    updatePayload.full_name = updateData.full_name || null;
  }

  if (updateData.height !== undefined) {
    updatePayload.height = updateData.height || null;
  }

  if (updateData.weight !== undefined) {
    updatePayload.weight = updateData.weight || null;
  }

  if (updateData.avatar_url !== undefined) {
    updatePayload.avatar_url = updateData.avatar_url || null;
  }

  const updatedProfile = await updateProfile(userId, updatePayload);

  return {
    id: updatedProfile.id,
    email: updatedProfile.email,
    full_name: updatedProfile.full_name,
    height: updatedProfile.height,
    weight: updatedProfile.weight,
    avatar_url: updatedProfile.avatar_url,
    created_at: updatedProfile.created_at,
    updated_at: updatedProfile.updated_at,
  };
};

export const uploadAvatar = async (userId, file) => {
  if (!file) {
    const error = new Error('File không được để trống');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = 'FILE_REQUIRED';
    throw error;
  }

  if (file.size > MAX_FILE_SIZE) {
    const error = new Error('File không được vượt quá 5MB');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error('File phải là định dạng JPG, JPEG hoặc PNG');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = 'INVALID_FILE_TYPE';
    throw error;
  }

  const fileExtension = file.originalname.split('.').pop();
  const fileName = `avatar.${fileExtension}`;
  const filePath = `${userId}/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    const error = new Error(`Lỗi upload file: ${uploadError.message}`);
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    error.code = 'UPLOAD_ERROR';
    throw error;
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    const error = new Error('Không thể lấy URL của file');
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    error.code = 'URL_GENERATION_ERROR';
    throw error;
  }

  return data.publicUrl;
};

