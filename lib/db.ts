import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Create a SQL client with the connection string
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Helper functions for database operations
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    throw error;
  }
}

export async function createUser(
  email: string,
  name: string,
  isOrganizer = false
) {
  try {
    const result = await sql`
      INSERT INTO users (email, name, is_organizer)
      VALUES (${email}, ${name}, ${isOrganizer})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
}

export async function createInvitation(userId: number) {
  try {
    const token = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const result = await sql`
      INSERT INTO invitations (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error in createInvitation:", error);
    throw error;
  }
}

export async function getInvitationByToken(token: string) {
  try {
    const result = await sql`
      SELECT i.*, u.email, u.name, u.is_organizer
      FROM invitations i
      JOIN users u ON i.user_id = u.id
      WHERE i.token = ${token} AND i.is_used = false AND i.expires_at > NOW()
      LIMIT 1
    `;
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error in getInvitationByToken:", error);
    throw error;
  }
}

export async function markInvitationAsUsed(id: number) {
  try {
    await sql`
      UPDATE invitations
      SET is_used = true
      WHERE id = ${id}
      `;
  } catch (error) {
    console.error("Error in markInvitationAsUsed:", error);
    throw error;
  }
}

export async function getRsvpByUserId(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM rsvps
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error in getRsvpByUserId:", error);
    throw error;
  }
}

export async function createOrUpdateRsvp(
  userId: number,
  status: string,
  plusOne = false,
  plusOneName: string | null = null
) {
  try {
    const existingRsvp = await getRsvpByUserId(userId);

    if (existingRsvp) {
      const result = await sql`
        UPDATE rsvps
        SET status = ${status}, plus_one = ${plusOne}, plus_one_name = ${plusOneName}, updated_at = NOW()
        WHERE id = ${existingRsvp.id}
        RETURNING *
      `;
      return result[0];
    } else {
      const result = await sql`
        INSERT INTO rsvps (user_id, status, plus_one, plus_one_name)
        VALUES (${userId}, ${status}, ${plusOne}, ${plusOneName})
        RETURNING *
      `;
      return result[0];
    }
  } catch (error) {
    console.error("Error in createOrUpdateRsvp:", error);
    throw error;
  }
}

export async function createNotification(userId: number, message: string) {
  try {
    const result = await sql`
      INSERT INTO notifications (user_id, message)
      VALUES (${userId}, ${message})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error in createNotification:", error);
    throw error;
  }
}

export async function getOrganizers() {
  try {
    return await sql`
      SELECT * FROM users WHERE is_organizer = true
    `;
  } catch (error) {
    console.error("Error in getOrganizers:", error);
    throw error;
  }
}

export async function getAllGuests() {
  try {
    return await sql`
      SELECT u.id, u.email, u.name, r.status, r.plus_one, r.plus_one_name, r.updated_at, r.joined_wechat
      FROM users u
      LEFT JOIN rsvps r ON u.id = r.user_id
      WHERE u.is_organizer = false
      ORDER BY u.name
    `;
  } catch (error) {
    console.error("Error in getAllGuests:", error);
    throw error;
  }
}

export async function getGuestStats() {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_guests,
        COUNT(CASE WHEN r.status = 'attending' THEN 1 END) as attending,
        COUNT(CASE WHEN r.status = 'not_attending' THEN 1 END) as not_attending,
        COUNT(CASE WHEN r.status = 'pending' OR r.status IS NULL THEN 1 END) as pending,
        COUNT(CASE WHEN r.plus_one = true THEN 1 END) as plus_ones
      FROM users u
      LEFT JOIN rsvps r ON u.id = r.user_id
      WHERE u.is_organizer = false
    `;
    return stats[0];
  } catch (error) {
    console.error("Error in getGuestStats:", error);
    throw error;
  }
}

// Helper function to generate a random token
function generateRandomToken() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export async function updateWeChatStatus(userId: number, joined: boolean) {
  try {
    await sql`
      UPDATE rsvps
      SET joined_wechat = ${joined}
      WHERE user_id = ${userId}
    `;
  } catch (error) {
    console.error("Error in updateWeChatStatus:", error);
    throw error;
  }
}

import { sendMagicLink as sendMagicLinkEmail } from "./email";

export const sendMagicLink = sendMagicLinkEmail;

import { notifyOrganizers as notifyOrganizersEmail } from "./email";

export const notifyOrganizers = notifyOrganizersEmail;

export async function addOrganizer(userId: number) {
  try {
    await sql`
      UPDATE users
      SET is_organizer = true
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error("Error in addOrganizer:", error);
    throw error;
  }
}

export async function removeOrganizer(userId: number) {
  try {
    await sql`
      UPDATE users
      SET is_organizer = false
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error("Error in removeOrganizer:", error);
    throw error;
  }
}

export async function updateOrganizer(userId: number, name: string) {
  try {
    await sql`
      UPDATE users
      SET name = ${name}
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error("Error in updateOrganizer:", error);
    throw error;
  }
}
