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
const TEST_EMAIL = Deno.env.get("TEST_EMAIL");

function buildRecapHtml(
  stats: { logs_count: number; photos_count: number; likes_count: number; top_location: string | null },
  unsubscribeUrl: string
): string {
  const highlightSection = stats.top_location
    ? `<div class="highlight-section">
        <h3>Top Memory</h3>
        <p>Your visit to <strong>${stats.top_location}</strong> sparked the most interest!</p>
      </div>`
    : `<div class="highlight-section">
        <h3>Great Week!</h3>
        <p>You had an active week on FullCircle. Keep it up!</p>
      </div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { padding: 40px 20px; }
    .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { padding: 40px 32px; text-align: center; background: #ffffff; }
    .logo { width: 80px; height: auto; margin-bottom: 12px; }
    .logo-text { display: block; font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.025em; }
    .stats-grid { padding: 0 32px; display: table; width: 100%; border-spacing: 10px; margin-bottom: 20px; }
    .stat-card { display: table-cell; background: #f1f5f9; padding: 20px; border-radius: 16px; text-align: center; width: 33%; }
    .stat-value { display: block; font-size: 24px; font-weight: 800; color: #1e293b; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
    .highlight-section { padding: 32px; background: #1e293b; color: #ffffff; text-align: center; margin: 0 32px 32px 32px; border-radius: 16px; }
    .highlight-section h3 { margin: 0 0 8px 0; font-size: 18px; }
    .highlight-section p { margin: 0; font-size: 14px; opacity: 0.8; }
    .content { padding: 0 32px 40px 32px; text-align: center; }
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
        <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Your week in review.</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">${stats.logs_count}</span>
          <span class="stat-label">Logs</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${stats.photos_count}</span>
          <span class="stat-label">Photos</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${stats.likes_count}</span>
          <span class="stat-label">Likes</span>
        </div>
      </div>
      ${highlightSection}
      <div class="content">
        <a href="https://fullcircle.bolt.host" class="button">Explore Your Full Timeline</a>
      </div>
      <div class="footer">
        You are receiving this because you use FullCircle.<br>
        <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildUnsubscribeHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - FullCircle</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f8fafc;">
  <div style="text-align:center;padding:48px;background:white;border-radius:20px;border:1px solid #e2e8f0;max-width:400px;">
    <div style="font-size:22px;font-weight:800;color:#1e293b;letter-spacing:-0.025em;margin-bottom:16px;">FullCircle</div>
    <h2 style="color:#1e293b;margin:0 0 8px 0;font-size:18px;">Unsubscribed</h2>
    <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px 0;">You will no longer receive weekly recap emails from FullCircle.</p>
    <a href="https://fullcircle.bolt.host" style="display:inline-block;padding:12px 28px;background-color:#1e293b;color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">Go to FullCircle</a>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const url = new URL(req.url);

    if (req.method === "GET" && url.searchParams.get("action") === "unsubscribe") {
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response("Invalid unsubscribe link.", {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ weekly_recap_enabled: false })
        .eq("unsubscribe_token", token)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        return new Response("Invalid or expired unsubscribe link.", {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }

      return new Response(buildUnsubscribeHtml(), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, display_name, unsubscribe_token")
      .eq("weekly_recap_enabled", true)
      .eq("email_notifications", true);

    if (profilesError) {
      return new Response(
        JSON.stringify({ error: profilesError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const profile of profiles || []) {
      try {
        const { data: stats, error: statsError } = await supabase.rpc(
          "get_user_weekly_stats",
          { target_user_id: profile.id }
        );

        if (statsError) {
          errors.push(`Stats error for ${profile.id}: ${statsError.message}`);
          continue;
        }

        if (stats.logs_count === 0 && stats.photos_count === 0 && stats.likes_count === 0) {
          skipped++;
          continue;
        }

        const {
          data: { user },
        } = await supabase.auth.admin.getUserById(profile.id);

        if (!user?.email) {
          skipped++;
          continue;
        }

        const functionUrl = `${SUPABASE_URL}/functions/v1/send-weekly-recap`;
        const unsubscribeUrl = `${functionUrl}?action=unsubscribe&token=${profile.unsubscribe_token}`;
        const html = buildRecapHtml(stats, unsubscribeUrl);

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [TEST_EMAIL || user.email],
            subject: TEST_EMAIL ? "[TEST] Your FullCircle Week in Review" : "Your FullCircle Week in Review",
            html,
          }),
        });

        if (resendRes.ok) {
          sent++;
        } else {
          const errData = await resendRes.json();
          errors.push(`Resend error for ${profile.id}: ${JSON.stringify(errData)}`);
        }
      } catch (e) {
        errors.push(
          `Error for ${profile.id}: ${e instanceof Error ? e.message : "Unknown"}`
        );
      }
    }

    return new Response(
      JSON.stringify({ sent, skipped, errors }),
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
