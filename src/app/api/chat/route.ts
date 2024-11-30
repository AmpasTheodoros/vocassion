import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();

    // Trigger a Pusher event for new chat messages
    await pusher.trigger('chat-channel', 'new-message', {
      message,
      userId
    });

    return new NextResponse('Message sent', { status: 200 });
  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
