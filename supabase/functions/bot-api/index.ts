import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CreateLogRequest {
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  trip_name?: string;
  is_public?: boolean;
  image_url?: string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function checkRateLimit(keyId: string): boolean {
  const now = Date.now();
  const limitInfo = rateLimitMap.get(keyId);

  if (!limitInfo || now > limitInfo.resetTime) {
    rateLimitMap.set(keyId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limitInfo.count >= RATE_LIMIT) {
    return false;
  }

  limitInfo.count++;
  return true;
}

async function validateApiKey(apiKey: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase.rpc("validate_bot_api_key", {
    api_key_input: apiKey,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

async function updateKeyUsage(keyId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  await supabase
    .from("bot_api_keys")
    .update({
      last_used_at: new Date().toISOString(),
      usage_count: supabase.rpc("increment", { row_id: keyId }),
    })
    .eq("id", keyId);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get("X-API-Key");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Missing API key",
          message: "Please provide an API key in the X-API-Key header",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const keyData = await validateApiKey(apiKey);

    if (!keyData || !keyData.is_valid) {
      return new Response(
        JSON.stringify({
          error: "Invalid API key",
          message: "The provided API key is invalid or has been revoked",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!checkRateLimit(keyData.key_id)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `Maximum ${RATE_LIMIT} requests per hour allowed`,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "POST") {
      const body: CreateLogRequest = await req.json();

      if (!body.title || !body.event_date) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields",
            message: "title and event_date are required",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const eventDate = new Date(body.event_date);
      if (isNaN(eventDate.getTime())) {
        return new Response(
          JSON.stringify({
            error: "Invalid date format",
            message: "event_date must be a valid ISO 8601 date (YYYY-MM-DD)",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: log, error: insertError } = await supabase
        .from("logs")
        .insert({
          user_id: keyData.user_id,
          title: body.title.trim(),
          description: body.description?.trim() || null,
          event_date: body.event_date,
          location: body.location?.trim() || null,
          trip_name: body.trip_name?.trim() || null,
          is_public: body.is_public !== undefined ? body.is_public : false,
          image_url: body.image_url?.trim() || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating log:", insertError);
        return new Response(
          JSON.stringify({
            error: "Failed to create log",
            message: insertError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      await updateKeyUsage(keyData.key_id);

      return new Response(
        JSON.stringify({
          success: true,
          log: log,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          message: "FullCircle Bot API",
          version: "1.0.0",
          endpoints: {
            POST: {
              description: "Create a new log entry",
              required_fields: ["title", "event_date"],
              optional_fields: [
                "description",
                "location",
                "trip_name",
                "is_public",
                "image_url",
              ],
            },
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Method not allowed",
        message: "Only GET and POST methods are supported",
      }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
