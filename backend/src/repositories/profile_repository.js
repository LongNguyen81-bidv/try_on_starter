import { supabase } from '../config/database.js';

export const findProfileByEmail = async (email) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, password_hash, full_name, role')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const createProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      email: profileData.email.toLowerCase(),
      password_hash: profileData.password_hash,
      full_name: profileData.full_name || null,
    })
    .select('id, email, full_name, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      const conflictError = new Error('Email đã được sử dụng');
      conflictError.statusCode = 409;
      conflictError.code = 'EMAIL_EXISTS';
      throw conflictError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const findProfileById = async (id) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, height, weight, avatar_url, role, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const notFoundError = new Error('Không tìm thấy hồ sơ');
      notFoundError.statusCode = 404;
      notFoundError.code = 'PROFILE_NOT_FOUND';
      throw notFoundError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const updateProfile = async (id, updateData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updateData.full_name,
      height: updateData.height,
      weight: updateData.weight,
      avatar_url: updateData.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, email, full_name, height, weight, avatar_url, role, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const notFoundError = new Error('Không tìm thấy hồ sơ');
      notFoundError.statusCode = 404;
      notFoundError.code = 'PROFILE_NOT_FOUND';
      throw notFoundError;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

