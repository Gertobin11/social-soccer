import { env } from '$env/dynamic/private';
import { createTransport } from 'nodemailer';

// gmail with nodemailer docs: https://nodemailer.com/usage/using-gmail
const transporter = createTransport({
	service: 'gmail',
	auth: {
		user: env.FROM_EMAIL,
		pass: env.GOOGLE_APP_PASSWORD
	}
});

/**
 * Function that sends a verification email to a user
 * @param email the emil of the user to send the email to
 * @param url the link the user will click to authenicate
 */
export async function sendVerificationEmail(email: string, url: string) {
	try {
		const mailOptions = {
			from: env.FROM_EMAIL,
			to: email,
			subject: 'Verification Link | Social Soccer',
			html: `<h1>Welcome to Social Soccer</h1><p> Please click on the link to verify and complete your registration</p><a href="${url}">Click Here</a>`
		};

		await transporter.verify();
		await transporter.sendMail(mailOptions);
	} catch (error) {
		// catch error as these are irregular
		// send plain email filed message instead
		throw new Error('Failed to send email');
	}
}

/**
 * Function that sends a password rest email
 * @param email The email of the user to send the email to
 * @param url The url thast ha the token to reset their email
 */
export async function sendPasswordRestEmail(email: string, url: string) {
	try {
		const mailOptions = {
			from: env.FROM_EMAIL,
			to: email,
			subject: 'Password Reset | Social Soccer',
			html: `<h1>Password Reset</h1><p>If you have requested a password reset, please click on the link </p><a href="${url}">Click Here</a>`
		};
		await transporter.verify();
		await transporter.sendMail(mailOptions);
	} catch (error) {
		// catch error as these are irregular
		// send plain email filed message instead
		throw new Error('Failed to send email');
	}
}
