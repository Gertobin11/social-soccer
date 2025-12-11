import { sendPasswordRestEmail, sendVerificationEmail } from '$lib/server/email';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import * as nodemailer from 'nodemailer';
import { verify } from 'crypto';

const mocks = vi.hoisted(() => ({
	verify: vi.fn(),
	sendMail: vi.fn()
}));
vi.mock(import('nodemailer'), async (importOriginal) => {
	const original = await importOriginal();
	return {
		...original,
		createTransport: vi.fn().mockReturnValue({
			verify: mocks.verify,
			sendMail: mocks.sendMail
		})
	};
});

describe('sendVerificationEmail', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should call send mail on the nodemailer transporter', async () => {
		await expect(sendVerificationEmail('test@mal.com', 'test-url')).resolves.not.toThrowError();
		expect(mocks.verify).toHaveBeenCalledOnce();
		expect(mocks.sendMail).toHaveBeenCalledWith({
			from: 'gertobindev@gmail.com',
			html: '<h1>Welcome to Social Soccer</h1><p> Please click on the link to verify and complete your registration</p><a href="test-url">Click Here</a>',
			subject: 'Verification Link | Social Soccer',
			to: 'test@mal.com'
		});
	});

	it('should catch and rethrow any error', async () => {
		mocks.verify.mockRejectedValue(Error('Failed to verify'));
		await expect(sendVerificationEmail('test@mal.com', 'test-url')).rejects.toThrowError(
			'Failed to send email'
		);
	});
});

describe('sendPasswordRestEmail', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should call send mail on the nodemailer transporter', async () => {
		await expect(sendPasswordRestEmail('test@mal.com', 'test-url')).resolves.not.toThrowError();
		expect(mocks.verify).toHaveBeenCalledOnce();
		expect(mocks.sendMail).toHaveBeenCalledWith({
			from: 'gertobindev@gmail.com',
			html: '<h1>Password Reset</h1><p>If you have requested a password reset, please click on the link </p><a href="test-url">Click Here</a>',
			subject: 'Password Reset | Social Soccer',
			to: 'test@mal.com'
		});
	});

	it('should catch and rethrow any error', async () => {
		mocks.verify.mockRejectedValue(Error('Failed to verify'));
		await expect(sendPasswordRestEmail('test@mal.com', 'test-url')).rejects.toThrowError(
			'Failed to send email'
		);
	});
});
