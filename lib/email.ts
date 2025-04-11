import nodemailer from "nodemailer";
import { getOrganizers } from "./db";

// Check if we're in a preview environment
let isPreviewEnvironment =
  process.env.NODE_ENV !== "production" || !process.env.SMTP_HOST;
// isPreviewEnvironment = false;
// Configure email transporter - use a mock transporter in preview
const transporter = isPreviewEnvironment
  ? {
      sendMail: async (mailOptions: any) => {
        console.log("PREVIEW MODE - Email would be sent:", mailOptions);
        return { messageId: "preview-mode-message-id" };
      },
    }
  : nodemailer.createTransport({
      name: "Layla & Kondwani",
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      // secure: process.env.SMTP_SECURE === "true",
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        // servername: "mail.maravianwebservices.com",
        rejectUnauthorized: false,
      },
    });

export async function sendMagicLink(
  email: string,
  token: string,
  isOrganizer = false,
  name: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLinkUrl = `${baseUrl}/${
    isOrganizer ? "organizer" : "invitation"
  }/verify?token=${token}`;

  const mailOptions = {
    from: `"Layla & Kondwani" <${
      process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: isOrganizer
      ? "Organizer Access Link"
      : `${name} You are cordially invited to Layla & Kondwani's Engagement Celebration`,
    html: isOrganizer
      ? `
      <!DOCTYPE html>
      <style>
        button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #fff;
            background-color: #D4AF37;
            border-radius: 5px;
            text-align: center;
            text-decoration: none;
        }
      </style>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000; text-align: center;">Organizer Access</h2>
          <p>Click the link below to access the organizer dashboard:</p>
          <a href="${magicLinkUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #D4AF37; border-radius: 5px; text-align: center; text-decoration: none; margin: 15px 0;">Go to Access</a>
          <p>This link will expire after use.</p>
        </div>
        </body>
        </html>
      `
      : `
      <body style="background: #000;">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: #000; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: white;">
        Sign in to <strong>Layla & Kondwani</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="gold"><a href="${magicLinkUrl}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: white; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid gold; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: white;">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
      `,
    // : `
    // <!DOCTYPE html>
    // <body>
    //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #e0e0e0;">
    //     <div style="text-align: center; margin-bottom: 20px;">
    //       <h1 style="color: #D4AF37; margin-bottom: 5px;">You're Cordially Invited</h1>
    //       <h2 style="margin-top: 0;">to a Special Celebration</h2>
    //       <h3 style="margin-top: 15px;">Honoring</h3>
    //       <h2 style="color: #D4AF37;">Layla & Kondwani</h2>
    //     </div>

    //     <div style="margin: 30px 0; text-align: center;">
    //       <h4 style="color: #D4AF37;">Dear ${name},</h4>
    //       <p>You have been invited to the engagement celebration for Layla and Kondwani.</p>
    //       <p>Please click the button below to view all the details and RSVP.</p>
    //       <p>This is a surprise proposal for Layla, please do not share this link or discuss the date and time with the bride to be as she is expecting this event to happen on a different date.</p>
    //     </div>

    //     <div style="text-align: center; margin: 40px 0 20px;">
    //       <a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 25px; background-color: #D4AF37; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 15px 0;">View Details & RSVP</a>
    //       <p style="margin-top: 10px; font-size: 0.8em; color: #666;">This link will expire after use.</p>
    //     </div>
    //   </div>
    // </body>
    // </html>
    // `,
  };

  // Return the magic link URL in preview mode
  if (isPreviewEnvironment) {
    await transporter.sendMail(mailOptions);
    return { magicLinkUrl };
  }

  // Actually send the email in production
  return transporter.sendMail(mailOptions);
}

export async function notifyOrganizers(message: string, subject: string) {
  // In preview mode, just log the notification
  if (isPreviewEnvironment) {
    console.log("PREVIEW MODE - Notification to organizers:", {
      subject,
      message,
    });
    return;
  }

  const organizers = await getOrganizers();

  if (!organizers.length) return;

  const mailOptions = {
    from: `"Layla & Kondwani Celebration" <${
      process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: organizers.map((org) => org.email).join(","),
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37; text-align: center;">Celebration Update</h2>
        <p>${message}</p>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/organizer" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Dashboard</a>
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendOrganizerStatusEmail(
  email: string,
  name: string,
  isAdded: boolean
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/organizer`;

  const mailOptions = {
    from: `"Layla & Kondwani Celebration" <${
      process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: isAdded
      ? "You've Been Added as an Organizer"
      : "Organizer Access Removed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37; text-align: center;">${
          isAdded ? "Welcome to the Team!" : "Organizer Access Update"
        }</h2>
        <p>Dear ${name},</p>
        <p>${
          isAdded
            ? "You have been added as an organizer for Layla and Kondwani's engagement celebration. You now have access to the organizer dashboard where you can manage guests and view RSVPs."
            : "Your access to the organizer dashboard for Layla and Kondwani's engagement celebration has been removed."
        }</p>
        ${
          isAdded
            ? `<p style="text-align: center; margin-top: 30px;">
                <a href="${dashboardUrl}" style="display: inline-block; padding: 10px 20px; background-color: #D4AF37; color: #fff; text-decoration: none; border-radius: 4px;">Access Dashboard</a>
              </p>`
            : ""
        }
      </div>
    `,
  };

  // Return the URL in preview mode
  if (isPreviewEnvironment) {
    console.log(
      "PREVIEW MODE - Organizer status email would be sent:",
      mailOptions
    );
    return { dashboardUrl };
  }

  // Actually send the email in production
  return transporter.sendMail(mailOptions);
}
