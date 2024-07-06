// src/pages/api/sse.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerAuthSession();

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send a ping every 30 seconds to keep the connection alive
  const pingInterval = setInterval(() => {
    res.write("event: ping\ndata: {}\n\n");
  }, 30000);

  // Clean up on close
  req.on("close", () => {
    clearInterval(pingInterval);
  });

  // TODO: Implement logic to send notifications to this client
  // This will be called when new notifications are created for this user
  // For example:
  // sendNotification(session.user.id, (notification) => {
  //   res.write(`data: ${JSON.stringify(notification)}\n\n`);
  // });
}
