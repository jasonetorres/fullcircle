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
const APP_URL = Deno.env.get("APP_URL") || "https://fullcircle.app";

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
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #f1f5f9;">
              <div style="font-size:20px;font-weight:700;color:#1e293b;letter-spacing:-0.3px;">FullCircle</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background-color:${config.bgColor};font-size:24px;text-align:center;">
                  <span style="color:${config.color};">${config.icon}</span>
                </div>
              </div>
              <p style="margin:0 0 8px;font-size:15px;color:#64748b;text-align:center;">
                Hey ${recipientName},
              </p>
              <p style="margin:0 0 24px;font-size:17px;color:#1e293b;text-align:center;line-height:1.5;">
                <strong>${actorName}</strong> ${config.message}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}" style="display:inline-block;padding:12px 32px;background-color:#1e293b;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                      Open FullCircle
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
                You received this because you have email notifications enabled.
                <br>
                You can turn them off in your account settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
        to: [recipientUser.email],
        subject,
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
