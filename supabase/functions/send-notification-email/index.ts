import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL =
  Deno.env.get("NOTIFICATION_FROM_EMAIL") ||
  "FullCircle <onboarding@resend.dev>";
const APP_URL = Deno.env.get("APP_URL") || "https://fullcircle.bolt.host";
const TEST_EMAIL = Deno.env.get("TEST_EMAIL");

interface NotificationRecord {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: "like" | "comment" | "reply" | "follow";
  log_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
}

function getSubjectLine(
  type: string,
  actorName: string,
  logTitle: string
): string {
  switch (type) {
    case "like":
      return `${actorName} liked your moment "${logTitle}"`;
    case "comment":
      return `${actorName} commented on "${logTitle}"`;
    case "reply":
      return `${actorName} replied to your comment`;
    case "follow":
      return `${actorName} started following you`;
    default:
      return "New notification on FullCircle";
  }
}

function buildEmailHtml(
  type: string,
  actorName: string,
  logTitle: string,
  recipientName: string
): string {
  const typeConfig: Record<
    string,
    { icon: string; color: string; bgColor: string; message: string }
  > = {
    like: {
      icon: "&#10084;",
      color: "#ef4444",
      bgColor: "#fef2f2",
      message: `liked your moment <strong>"${logTitle}"</strong>`,
    },
    comment: {
      icon: "&#128172;",
      color: "#3b82f6",
      bgColor: "#eff6ff",
      message: `commented on <strong>"${logTitle}"</strong>`,
    },
    reply: {
      icon: "&#8617;",
      color: "#14b8a6",
      bgColor: "#f0fdfa",
      message: "replied to your comment",
    },
    follow: {
      icon: "&#43;",
      color: "#10b981",
      bgColor: "#ecfdf5",
      message: "started following you",
    },
  };

  const config = typeConfig[type] || typeConfig.like;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FullCircle Notification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { padding: 40px 20px; }
    .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { padding: 40px 32px; text-align: center; background: #ffffff; }
    .logo { width: 80px; height: auto; margin-bottom: 12px; }
    .logo-text { display: block; font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.025em; }
    .content { padding: 32px; text-align: center; }
    .icon-circle { display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: ${config.bgColor}; font-size: 24px; margin-bottom: 24px; }
    .icon { color: ${config.color}; }
    .greeting { margin: 0 0 8px; font-size: 15px; color: #64748b; }
    .message { margin: 0 0 24px; font-size: 17px; color: #1e293b; line-height: 1.5; }
    .button { background-color: #1e293b; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; }
    .footer { padding: 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="https://ujpjuqeybegruuayzzeb.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-02-09%20at%209.52.01%20AM.png" alt="FullCircle" class="logo">
        <span class="logo-text">FullCircle</span>
      </div>
      <div class="content">
        <div class="icon-circle">
          <span class="icon">${config.icon}</span>
        </div>
        <p class="greeting">Hey ${recipientName},</p>
        <p class="message"><strong>${actorName}</strong> ${config.message}</p>
        <a href="${APP_URL}" class="button">Open FullCircle</a>
      </div>
      <div class="footer">
        You received this because you have email notifications enabled.<br>
        You can turn them off in your account settings.
      </div>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { record } = (await req.json()) as { record: NotificationRecord };

    if (!record) {
      return new Response(
        JSON.stringify({ error: "No notification record provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("username, display_name, email_notifications")
      .eq("id", record.recipient_id)
      .maybeSingle();

    if (!recipientProfile?.email_notifications) {
      return new Response(
        JSON.stringify({ message: "Email notifications disabled for user" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const {
      data: { user: recipientUser },
    } = await supabase.auth.admin.getUserById(record.recipient_id);

    if (!recipientUser?.email) {
      return new Response(
        JSON.stringify({ error: "Recipient email not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: actorProfile } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", record.actor_id)
      .maybeSingle();

    const actorName =
      actorProfile?.display_name || actorProfile?.username || "Someone";
    const recipientName =
      recipientProfile.display_name || recipientProfile.username || "there";

    let logTitle = "";
    if (record.log_id) {
      const { data: log } = await supabase
        .from("logs")
        .select("title")
        .eq("id", record.log_id)
        .maybeSingle();
      logTitle = log?.title || "a moment";
    }

    const subject = getSubjectLine(record.type, actorName, logTitle);
    const html = buildEmailHtml(
      record.type,
      actorName,
      logTitle,
      recipientName
    );

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TEST_EMAIL || recipientUser.email],
        subject: TEST_EMAIL ? `[TEST] ${subject}` : subject,
        html,
        headers: {
          "X-Entity-Ref-ID": record.id,
        },
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
