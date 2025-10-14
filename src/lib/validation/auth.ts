import z from 'zod/v4';

export const signupSchema = z
	.object({
		email: z.email({ pattern: z.regexes.unicodeEmail }),
		password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export const loginSchema = z.object({
	email: z.email({ pattern: z.regexes.unicodeEmail }),
	password: z.string()
});

export const passwordResetSchema = z.object({
	email: z.email({ pattern: z.regexes.unicodeEmail })
});

export const newPasswordSchema = z
	.object({
		password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});
