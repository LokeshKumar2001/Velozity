export interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  connectedAt: Date;
}

export class PresenceManager {
  // Map of userId -> Set of socket IDs (handles multiple browser tabs)
  private userSockets: Map<string, Set<string>> = new Map();
  // Map of userId -> User metadata
  private users: Map<string, OnlineUser> = new Map();

  addUser(socketId: string, user: { userId: string; name: string; email: string; role: string }): boolean {
    const isFirstConnection = !this.userSockets.has(user.userId);

    if (isFirstConnection) {
      this.userSockets.set(user.userId, new Set([socketId]));
      this.users.set(user.userId, {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        connectedAt: new Date(),
      });
    } else {
      this.userSockets.get(user.userId)!.add(socketId);
    }

    return isFirstConnection; // true if transitioned from offline -> online
  }

  removeUser(socketId: string, userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return false;

    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      this.users.delete(userId);
      return true; // true if transitioned from online -> offline
    }

    return false;
  }

  getOnlineCount(): number {
    return this.users.size;
  }

  getOnlineUsers(): OnlineUser[] {
    return Array.from(this.users.values());
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

export const presenceManager = new PresenceManager();
export default presenceManager;
