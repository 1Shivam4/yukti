import { prisma } from "@yukti/database";
import { randomUUID } from "crypto";

const MAX_DEVICES = 3;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export interface DeviceInfo {
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionData {
  id: string;
  deviceId: string;
  deviceName: string | null;
  deviceType: string | null;
  lastActive: Date;
  createdAt: Date;
  isActive: boolean;
}

/**
 * Generate a unique device ID
 */
export function generateDeviceId(): string {
  return `dev_${randomUUID()}`;
}

/**
 * Create a new device session for a user
 * Enforces the max device limit by removing oldest sessions
 */
export async function createSession(
  userId: string,
  refreshToken: string,
  deviceInfo: DeviceInfo
): Promise<{ session: SessionData; removedSessions: SessionData[] }> {
  const deviceId = deviceInfo.deviceId || generateDeviceId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // Check if device already has a session - update it
  const existingSession = await prisma.userSession.findUnique({
    where: { deviceId },
  });

  if (existingSession) {
    const updated = await prisma.userSession.update({
      where: { deviceId },
      data: {
        refreshToken,
        lastActive: new Date(),
        expiresAt,
        isActive: true,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
      },
    });

    return {
      session: {
        id: updated.id,
        deviceId: updated.deviceId,
        deviceName: updated.deviceName,
        deviceType: updated.deviceType,
        lastActive: updated.lastActive,
        createdAt: updated.createdAt,
        isActive: updated.isActive,
      },
      removedSessions: [],
    };
  }

  // Enforce device limit
  const removedSessions = await enforceDeviceLimit(userId, MAX_DEVICES - 1);

  // Create new session
  const session = await prisma.userSession.create({
    data: {
      userId,
      deviceId,
      deviceName: deviceInfo.deviceName || "Unknown Device",
      deviceType: deviceInfo.deviceType || "web",
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      refreshToken,
      expiresAt,
      isActive: true,
    },
  });

  return {
    session: {
      id: session.id,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      lastActive: session.lastActive,
      createdAt: session.createdAt,
      isActive: session.isActive,
    },
    removedSessions,
  };
}

/**
 * Enforce device limit by removing oldest sessions
 */
export async function enforceDeviceLimit(
  userId: string,
  maxDevices: number = MAX_DEVICES
): Promise<SessionData[]> {
  const activeSessions = await prisma.userSession.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      lastActive: "asc",
    },
  });

  const sessionsToRemove = activeSessions.slice(0, Math.max(0, activeSessions.length - maxDevices));

  if (sessionsToRemove.length > 0) {
    await prisma.userSession.updateMany({
      where: {
        id: { in: sessionsToRemove.map((s) => s.id) },
      },
      data: {
        isActive: false,
      },
    });
  }

  return sessionsToRemove.map((s) => ({
    id: s.id,
    deviceId: s.deviceId,
    deviceName: s.deviceName,
    deviceType: s.deviceType,
    lastActive: s.lastActive,
    createdAt: s.createdAt,
    isActive: false,
  }));
}

/**
 * Validate a session by refresh token
 */
export async function validateSession(
  refreshToken: string
): Promise<{ valid: boolean; session?: SessionData; userId?: string }> {
  const session = await prisma.userSession.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session) {
    return { valid: false };
  }

  if (!session.isActive) {
    return { valid: false };
  }

  if (session.expiresAt < new Date()) {
    await prisma.userSession.update({
      where: { id: session.id },
      data: { isActive: false },
    });
    return { valid: false };
  }

  return {
    valid: true,
    session: {
      id: session.id,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      lastActive: session.lastActive,
      createdAt: session.createdAt,
      isActive: session.isActive,
    },
    userId: session.userId,
  };
}

/**
 * Update session with new refresh token and last active time
 */
export async function updateSession(sessionId: string, refreshToken: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.userSession.update({
    where: { id: sessionId },
    data: {
      refreshToken,
      lastActive: new Date(),
      expiresAt,
    },
  });
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.userSession.update({
    where: { id: sessionId },
    data: { isActive: false },
  });
}

/**
 * Revoke session by device ID
 */
export async function revokeSessionByDeviceId(deviceId: string): Promise<void> {
  await prisma.userSession.update({
    where: { deviceId },
    data: { isActive: false },
  });
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllSessions(userId: string): Promise<number> {
  const result = await prisma.userSession.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  return result.count;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
  const sessions = await prisma.userSession.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      lastActive: "desc",
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    deviceId: s.deviceId,
    deviceName: s.deviceName,
    deviceType: s.deviceType,
    lastActive: s.lastActive,
    createdAt: s.createdAt,
    isActive: s.isActive,
  }));
}

/**
 * Clean up expired sessions (for scheduled cleanup)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.userSession.updateMany({
    where: {
      expiresAt: { lt: new Date() },
      isActive: true,
    },
    data: { isActive: false },
  });

  return result.count;
}
