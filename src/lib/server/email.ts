import { env } from '$env/dynamic/private';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
	apiKey: env.EMAIL_TOKEN
});

export async function sendVerificationEmail(email: string, url: string) {
	const sentFrom = new Sender('socialsoccerireland@gmail.com', 'Gerard Tobin');

	const recipients = [new Recipient(email)];

	const emailParams = new EmailParams()
		.setFrom(sentFrom)
		.setTo(recipients)
		.setReplyTo(sentFrom)
		.setSubject('Verification Link | Social Soccer')
		.setHtml(
			`<h1>Welcome to Social Soccer</h1><p> Please click on the link to verify and complete your registration</p><a href="${url}">Click Here</a>`
		)

	await mailerSend.email.send(emailParams);
}
