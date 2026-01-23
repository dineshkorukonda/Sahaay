import nodemailer from 'nodemailer';

// Create transporter - using Gmail as default, but can be configured via env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP credentials not configured. OTP email would be:', otp);
        // In development, you might want to just log the OTP
        console.log(`OTP for ${email}: ${otp}`);
        return;
    }

    const mailOptions = {
        from: `"Sahaay" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email - Sahaay',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Sahaay</h1>
                </div>
                <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1f2937; margin-top: 0;">Email Verification</h2>
                    <p style="color: #4b5563; font-size: 16px;">Thank you for signing up for Sahaay! Please use the following OTP to verify your email address:</p>
                    <div style="background: #f3f4f6; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                        <p style="font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 8px; margin: 0;">${otp}</p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This OTP will expire in 10 minutes.</p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">If you didn't create an account with Sahaay, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
                    <p>© 2026 Sahaay Platform. All rights reserved.</p>
                </div>
            </body>
            </html>
        `,
        text: `
            Sahaay - Email Verification
            
            Thank you for signing up for Sahaay! Please use the following OTP to verify your email address:
            
            ${otp}
            
            This OTP will expire in 10 minutes.
            
            If you didn't create an account with Sahaay, please ignore this email.
            
            © 2026 Sahaay Platform.
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
}
