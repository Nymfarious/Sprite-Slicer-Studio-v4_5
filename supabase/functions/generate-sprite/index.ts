import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const { type, prompt, characterPrompt, actionPrompt, poseCount, columns, styleReference, width, height } = body;

    let imagePrompt: string;

    if (type === "pose") {
      // Single pose generation
      imagePrompt = `Generate a single sprite image for game animation:
${prompt}

Requirements:
- Clean, isolated sprite on transparent or solid color background
- Consistent lighting from top-left
- Clear silhouette suitable for game use
- Size: approximately ${width || 256}x${height || 256} pixels
- High quality, game-ready asset`;

      if (styleReference) {
        imagePrompt += `\n\nMatch the art style of the reference image provided.`;
      }
    } else if (type === "sheet") {
      // Sprite sheet generation
      const rows = Math.ceil(poseCount / columns);
      
      imagePrompt = `Generate a sprite sheet for game animation:

Character: ${characterPrompt}

Action sequence: ${actionPrompt}

Layout:
- ${poseCount} poses total
- ${columns} columns × ${rows} rows grid
- Each cell should be equally sized
- Clear separation between poses
- Consistent character size and position across all poses

Animation requirements:
- Poses should flow naturally from one to the next
- Maintain consistent art style throughout
- Same character design in each pose
- Clear, readable silhouettes
- Suitable for game sprite animation

Output a single image containing all ${poseCount} poses arranged in a grid.`;
    } else {
      throw new Error("Invalid generation type");
    }

    console.log("Generating sprite with prompt:", imagePrompt);

    // Call Lovable AI gateway for image generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: styleReference
              ? [
                  { type: "text", text: imagePrompt },
                  { type: "image_url", image_url: { url: styleReference } },
                ]
              : imagePrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the generated image URL from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image was generated");
    }

    console.log("Successfully generated sprite image");

    return new Response(
      JSON.stringify({ 
        imageUrl,
        message: data.choices?.[0]?.message?.content || "Sprite generated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-sprite function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
