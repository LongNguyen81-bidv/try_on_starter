import { z } from 'zod';

const emailSchema = z
  .string()
  .email('Email không hợp lệ')
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất một chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất một chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất một số')
  .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất một ký tự đặc biệt');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export const validateRegisterInput = (data) => {
  return registerSchema.parse(data);
};

export const validateLoginInput = (data) => {
  return loginSchema.parse(data);
};

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .max(255, 'Tên không được vượt quá 255 ký tự')
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional(),
  height: z
    .union([z.number(), z.string(), z.null()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? null : num;
    })
    .refine(
      (val) => {
        if (val === null) return true;
        return typeof val === 'number' && val >= 100 && val <= 250;
      },
      { message: 'Chiều cao phải từ 100 đến 250 cm' }
    )
    .nullable()
    .optional(),
  weight: z
    .union([z.number(), z.string(), z.null()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? null : num;
    })
    .refine(
      (val) => {
        if (val === null) return true;
        return typeof val === 'number' && val >= 30 && val <= 250;
      },
      { message: 'Cân nặng phải từ 30 đến 250 kg' }
    )
    .nullable()
    .optional(),
  avatar_url: z
    .union([z.string().url('URL avatar không hợp lệ'), z.null()])
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional(),
});

export const validateUpdateProfileInput = (data) => {
  return updateProfileSchema.parse(data);
};

