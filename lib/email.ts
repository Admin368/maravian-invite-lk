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
  name: string,
  redirect?: string
) {
  const redirectUrl = redirect ? `&redirect=${redirect}` : "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLinkUrl = `${baseUrl}/${
    isOrganizer ? "organizer" : "invitation"
  }/verify?token=${token}${redirectUrl}`;

  const mailOptions = {
    from: `"Layla & Kondwani" <${
      process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: isOrganizer
      ? "Organizer Access Link"
      : `${name} You are cordially invited to Layla & Kondwani's Engagement Celebration`,
    text: `Sign in to Layla & Kondwani\n${magicLinkUrl}\n\n`,
    html: isOrganizer
      ? `
      <!DOCTYPE html>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 30px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #D4AF37; text-align: center; margin-bottom: 30px; font-size: 28px;">Organizer Access</h2>
          <div style="text-align: center;">
            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Click the link below to access the organizer dashboard:</p>
            <a href="${magicLinkUrl}" target="_blank" style="display: inline-block; padding: 12px 30px; font-size: 16px; color: #ffffff; background-color: #D4AF37; border-radius: 5px; text-align: center; text-decoration: none; margin: 15px 0; transition: background-color 0.3s ease;">Go to Access</a>
            <p style="color: #666666; font-size: 14px; margin-top: 25px;">This link will expire after use.</p>
          </div>
        </div>
      </body>
      </html>
        `
      : `
    <!DOCTYPE html>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #e0e0e0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #D4AF37; margin-bottom: 5px;">You're Cordially Invited</h1>
          <h2 style="margin-top: 0;">to a Special Celebration</h2>
          <h3 style="margin-top: 15px;">Honoring</h3>
          <h2 style="color: #D4AF37;">Layla & Kondwani</h2>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <h4 style="color: #D4AF37;">Dear ${name},</h4>
          <p>You have been invited to the engagement celebration for Layla and Kondwani.</p>
          <p>Please click the button below to view all the details and RSVP.</p>
          <p style="color: red;">This is a surprise proposal for Layla, please do not share this link or discuss the date and time with the bride to be, as she is expecting this event to happen on a different date.</p>
        </div>
        <div style="text-align: center; margin: 40px 0 20px;">
          <a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 25px; background-color: #D4AF37; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 15px 0;">View Details & RSVP</a>
          <p>if you cannot click the link copy and paste it into your browser</p>
          <p>${magicLinkUrl}</p>
          <p style="margin-top: 10px; font-size: 0.8em; color: #666;">This link will expire after use.</p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  // Return the magic link URL in preview mode
  if (isPreviewEnvironment) {
    await transporter.sendMail(mailOptions);
    return { magicLinkUrl };
  }

  // Actually send the email in production
  return transporter.sendMail(mailOptions);
}
export async function sendMenuLink(
  email: string,
  token: string,
  isOrganizer = false,
  name: string,
  redirect?: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/invitation/verify?token=${token}${redirect ? `&redirect=${redirect}` : ""}`;

  const mailOptions = {
    from: `"Layla & Kondwani Celebration" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject:"Menu Selection Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37; text-align: center;">
          ${redirect === "/menu" ? "Menu Selection Required" : "Welcome"}
        </h2>
        <p>Dear ${name},</p>
        ${
          redirect === "/menu"
            ? `
              <p><strong>Urgent:</strong> The restaurant would like to know your meal preferences ahead of time.</p>
              <p>Please click the link below to select your meal options. This will help the resturant ensure everything is prepared ahead of time.</p>
              <p>Note: Each guest will be responsible for paying for their own meal.</p>
              `
            : `<p>You've been invited to celebrate with us!</p>`
        }
        <p style="text-align: center; margin-top: 30px;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #D4AF37; color: #fff; text-decoration: none; border-radius: 4px;">
            ${redirect === "/menu" ? "Select Your Meal" : "View Invitation"}
          </a>
        </p>
      </div>
    `,
  };
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
