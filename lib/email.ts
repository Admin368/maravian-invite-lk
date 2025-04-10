import nodemailer from "nodemailer"
import { getOrganizers } from "./db"

// Check if we're in a preview environment
const isPreviewEnvironment = process.env.NODE_ENV !== "production" || !process.env.SMTP_HOST

// Configure email transporter - use a mock transporter in preview
const transporter = isPreviewEnvironment
  ? {
      sendMail: async (mailOptions: any) => {
        console.log("PREVIEW MODE - Email would be sent:", mailOptions)
        return { messageId: "preview-mode-message-id" }
      },
    }
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

export async function sendMagicLink(email: string, token: string, isOrganizer = false) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const magicLinkUrl = `${baseUrl}/${isOrganizer ? "organizer" : "invitation"}/verify?token=${token}`

  const mailOptions = {
    from: `"Layla & Kondwani Celebration" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: isOrganizer ? "Organizer Access Link" : "Your Invitation to Layla & Kondwani's Celebration",
    html: isOrganizer
      ? `
      <!DOCTYPE html>
      <style>
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #fff;
            background-color: #007bff;
            border-radius: 5px;
            text-align: center;
            text-decoration: none;
        }
      </style>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000; text-align: center;">Organizer Access</h2>
          <p>Click the link below to access the organizer dashboard:</p>
          <p style="text-align: center;">
            <a href="${magicLinkUrl}" class="button">Access Dashboard</a>
            <button>Go to Access</button>
          </p>
          <p>This link will expire after use.</p>
        </div>
        </body>
        </html>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #e0e0e0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #D4AF37; margin-bottom: 5px;">You're Cordially Invited</h1>
            <h2 style="margin-top: 0;">to a Surprise Engagement Celebration</h2>
            <h3 style="margin-top: 15px;">Honoring</h3>
            <h2 style="color: #D4AF37;">Layla & Kondwani</h2>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <p>🗓 Date: Wednesday, April 16th, 2025</p>
            <p>🕔 Time: 5:00 PM</p>
            <p>📍 Location: 武珞路武商梦时代 A 区 2 楼 A211B 号</p>
            <p>(Wushang Dream Plaza, A Section, 2nd Floor, 211B)</p>
            <p>🚇 Subway Stop: Line 2 Baotong Temple</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <p>With hearts full of joy and thanksgiving, we are excited to celebrate the love story of Layla and Emmanuel as they take this beautiful step toward forever.</p>
            <p><strong>This will be a surprise for Layla</strong>, so we kindly ask all guests to arrive on time and keep the celebration a joyful secret until the special moment is revealed.</p>
            <p>Let us gather together in love, laughter, and blessings as we witness the beginning of a God-ordained union.</p>
            <p style="font-style: italic;">"Therefore what God has joined together, let no one separate." Mark 10:9</p>
            <p>We would be honored by your presence.</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <p>🎀 Color Theme: White | Black | Gold</p>
            <p>(Kindly dress in theme to honor the couple)</p>
          </div>
          
          <div style="text-align: center; margin: 40px 0 20px;">
            <a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 25px; background-color: #D4AF37; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">RSVP Now</a>
            <p style="margin-top: 10px; font-size: 0.8em; color: #666;">This link will expire after use.</p>
          </div>
        </div>
      `,
  }

  // Return the magic link URL in preview mode
  if (isPreviewEnvironment) {
    await transporter.sendMail(mailOptions)
    return { magicLinkUrl }
  }

  // Actually send the email in production
  return transporter.sendMail(mailOptions)
}

export async function notifyOrganizers(message: string, subject: string) {
  // In preview mode, just log the notification
  if (isPreviewEnvironment) {
    console.log("PREVIEW MODE - Notification to organizers:", { subject, message })
    return
  }

  const organizers = await getOrganizers()

  if (!organizers.length) return

  const mailOptions = {
    from: `"Layla & Kondwani Celebration" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: organizers.map((org) => org.email).join(","),
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37; text-align: center;">Celebration Update</h2>
        <p>${message}</p>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/organizer" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Dashboard</a>
        </p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}
