// src/server/email.ts

import nodemailer from "nodemailer";
import { env } from "~/env.mjs";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_SERVER_HOST,
  port: env.EMAIL_SERVER_PORT,
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${env.NEXTAUTH_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Verify your email for MyAmble",
    html: `Please click this link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Reset your password for MyAmble",
    html: `
        <p>Hello,</p>
        <p>You have requested to reset your password for MyAmble. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>MyAmble Team</p>
      `,
  });
}
