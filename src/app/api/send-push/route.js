import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  'mailto:admin@sdcnitc.com', // Replace with your admin email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// We use the service role key to bypass RLS and fetch all user subscriptions securely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { title, message } = await req.json();

    // 1. Fetch all students who have opted into push notifications
    const { data: students, error } = await supabase
      .from('mahabba_students')
      .select('push_sub')
      .not('push_sub', 'is', null);

    if (error) throw error;
    if (!students || students.length === 0) return NextResponse.json({ count: 0 });

    const payload = JSON.stringify({ title, body: message });
    let successCount = 0;

    // 2. Send the push to every stored subscription
    await Promise.all(
      students.map(async (student) => {
        try {
          await webpush.sendNotification(student.push_sub, payload);
          successCount++;
        } catch (e) {
          // If subscription is expired/unsubscribed by user, we log it (you can optionally delete it from DB here)
          console.error("Failed to send to a device:", e.statusCode);
        }
      })
    );

    return NextResponse.json({ success: true, count: successCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}