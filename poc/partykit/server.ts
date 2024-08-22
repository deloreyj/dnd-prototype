import type * as Party from 'partykit/server';

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // Handle new WebSocket connections
  async onConnect(connection: Party.Connection): Promise<void> {
    console.log('Client connected:', connection.id);
    this.room.broadcast(`${connection.id} joined the room.`);
  }

  // Handle incoming WebSocket messages
  async onMessage(message: string, sender: Party.Connection): Promise<void> {
    console.log('Received message:', message);
    this.room.broadcast(`${sender.id} says: ${message}`);
  }

  // Handle WebSocket disconnections
  async onClose(connection: Party.Connection): Promise<void> {
    console.log('Client disconnected:', connection.id);
    this.room.broadcast(`${connection.id} left the room.`);
  }
}
