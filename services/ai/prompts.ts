
import { GenConfig, RenderSettings, DesignLayer } from "../../types";

// --- HELPERS ---
const getMaterialInstruction = (material: string, referenceBase64: boolean) => {
  if (referenceBase64) {
      return `
        CRITICAL TEXTURE & PHYSICS INSTRUCTION (MATERIAL REFERENCE PROVIDED):
        - **SOURCE OF TRUTH**: The MATERIAL REFERENCE IMAGE provided defines the surface.
        - **ACTION**: Extract the exact fabric weave, grain, roughness, and reflection properties from it.
        - **TEXTURE MAPPING**: Mathematically map this texture onto the geometry defined by the Sketch.
        - **LIGHT INTERACTION**: Ensure the specular highlights matches the reference material's physical properties.
      `;
  }
  return `
        MATERIAL SIMULATION: ${material}. 
        - Generate high-fidelity texture details characteristic of ${material}.
        - Ensure visible fabric grain (threads/weave) consistent with macro photography.
        - Simulate natural fabric weight and stiffness associated with this material.
  `;
};

const getStyleInstruction = (hasStyleRef: boolean) => {
  if (!hasStyleRef) return "";
  return `
    **STYLE & CONCEPT TRANSFER (STYLE REFERENCE IMAGE PROVIDED):**
    - **ROLE**: The STYLE REFERENCE IMAGE defines the **Photography Concept, Lighting, Camera Angle, and Product Presentation styling**.
    - **LIGHTING MATCHING**: Analyze the light source (softbox, hard light, natural), shadows, and color grading of the Style Reference and replicate it exactly.
    - **POSING/STYLING**: 
      - If the Style Reference shows a specific fold, hanger drape, or ghost mannequin shape, MIMIC THAT EXACT SHAPE NUANCE.
      - **CRITICAL CONSTRAINT**: You must COPY the "Vibe" and "Shape Styling" of the Style Reference, BUT you must **APPLY the Design Details (Pockets, Seams, Cuts, Logos)** from the SKETCH.
      - Do NOT copy the clothing design of the Style Reference. Only copy its *presentation*.
  `;
};

const getColorInstruction = (color: string, useSketchColors: boolean) => {
  if (useSketchColors) {
    return `
      STRICT COLOR REPRODUCTION (PIXEL ANALYSIS MODE):
      - **SOURCE OF TRUTH**: Analyze the pixels of IMAGE 1 (Sketch) to determine the color palette.
      - **ACTION**: Extract the exact hex codes, gradients, and color distribution used in the sketch.
      - **APPLICATION**: Apply these exact colors to the final render. Do NOT apply a global color filter.
      - **ZONING**: Ensure multi-colored areas (e.g., sleeves vs body, stripes, patterns) maintain the exact spatial arrangement as drawn.
      - **NO HALLUCINATION**: Do not invent new colors that are not present in the sketch.
    `;
  }
  return `COLOR GRADING: Apply the color '${color}' as the primary dye. Ensure the color interacts naturally with the lighting (lighter in highlights, deeper in folds).`;
};

// --- PROMPTS ---

export const getSketchToRealityPrompt = (
  category: string,
  material: string,
  color: string,
  useSketchColors: boolean,
  description: string,
  config: GenConfig,
  hasReferenceImage: boolean,
  hasStyleReference: boolean,
  outputMode: 'flatlay' | '3d' = '3d'
) => {

  const baseViewPointInstruction = outputMode === 'flatlay' 
    ? `
      **VIEWPOINT: PROFESSIONAL STUDIO FLATLAY (Luxury E-commerce Standard)**
      - **Setup**: Top-down 90° view, perfectly symmetrical arrangement.
      - **Styling**: "Invisible Pinning/Knolling" technique. The garment should look like it has body and volume, NOT flat like paper. 
        - Create subtle undulations in the fabric to show weight.
        - Sleeves should be styled neatly alongside the body or angled naturally.
      - **Lighting**: Soft, large-source diffused light from top-left (Softbox). Create realistic contact shadows (Ambient Occlusion) underneath to separate the item from the white background.
      - **Detail**: Focus on the collar shape, cuff rigidity, and hemline drape. High texture visibility.
    `
    : `
      **VIEWPOINT: HIGH-END STUDIO GHOST MANNEQUIN / MODEL**
      - **Setup**: Eye-level or slightly low angle (Hero shot).
      - **Form**: The garment must look filled by a body (invisible mannequin effect). Emphasize the 3D volume of chest, shoulders, and waist.
      - **Drape**: Fabric must hang naturally with gravity. Heavy fabrics (denim, wool) have stiff folds; light fabrics (silk, cotton) have micro-wrinkles.
      - **Lighting**: Commercial fashion lighting (Three-point setup). Key light for definition, Fill light for shadow detail, Rim light for separation.
    `;

  return `
    SYSTEM ROLE: You are an expert Fashion Photographer & Retoucher working for a luxury brand (e.g., Gucci, Dior, Nike). Your task is to turn a technical sketch into a FINAL CAMPAIGN IMAGE.
    
    INPUT DATA ANALYSIS:
    - **IMAGE 1 (THE SKETCH)**: [HARD CONSTRAINT] This is the blueprint. You must preserve the exact seam lines, pocket placements, collar shape, and silhouette.
    ${hasReferenceImage ? '- **IMAGE 2 (MATERIAL REF)**: [HARD CONSTRAINT] Use this exact texture/pattern.' : ''}
    ${hasStyleReference ? `- **IMAGE ${hasReferenceImage ? '3' : '2'} (STYLE REF)**: [SOFT CONSTRAINT] Copy the lighting mood and background vibe.` : ''}
    
    PRODUCT SPECS:
    - Item: ${category}
    - Details: ${description}
    
    ${hasStyleReference ? getStyleInstruction(true) : baseViewPointInstruction}

    PHOTOGRAPHY & RENDERING RULES:
    1. **HYPER-REALISM**: The result must look like a RAW photo taken with a professional studio camera (e.g., Hasselblad, Sony Alpha). 
       - NO "AI illustration" look.
       - NO "plastic" skin or fabric.
       - Visible fabric weave/grain at 100% zoom.
    
    2. **FABRIC PHYSICS**:
       - Calculate light transport on the specific material: ${material}. 
       - ${material.toLowerCase().includes('silk') ? 'Anisotropic reflections (sheen).' : ''}
       - ${material.toLowerCase().includes('cotton') ? 'Subsurface scattering (softness).' : ''}
       - ${material.toLowerCase().includes('leather') ? 'Specular highlights and micro-creases.' : ''}
    
    ${getMaterialInstruction(material, hasReferenceImage)}
    ${getColorInstruction(color, useSketchColors)}
    
    STUDIO SETTINGS:
    ${hasStyleReference ? '- **FOLLOW STYLE REFERENCE**.' : '- **Background**: Pure White (#FFFFFF) or Light Gray (#F5F5F5) seamless paper background. \n- **Color Grading**: Neutral, commercial grade, high contrast, sharp details.'}
    
    NEGATIVE PROMPTS:
    - Illustration, painting, drawing, sketch, cartoon, anime, 3d render style, low res, blur.
    - Distorted details, extra limbs, bad anatomy.
    ${outputMode === 'flatlay' && !hasStyleReference ? '- Human body, hands, legs, head, mannequin stand.' : ''}
`;
};

export const getRealisticRenderPrompt = (
  layers: DesignLayer[],
  renderSettings: RenderSettings,
  config: GenConfig
) => {
  // Construct detailed print descriptions from layers
  let printDescriptions = "";
  layers.forEach((layer, index) => {
    if (layer.printType !== 'normal') {
        let typeDesc = "";
        switch (layer.printType) {
            case 'high_density': typeDesc = "High-Density Rubber Print (Raised 3D effect > 0.5mm, sharp vertical edges, matte rubber texture)"; break;
            case 'heat_transfer': typeDesc = "Heat Transfer/PET (Thin film, smooth surface, slightly glossy/satin finish, high detail)"; break;
            case 'embroidery': typeDesc = "Embroidery (Thread texture, visible satin stitches, light catching on individual threads, physical 3D lift from fabric)"; break;
            case 'decal': typeDesc = "Decal (Vinyl texture, solid plastic feel, unified block)"; break;
            case 'screen': typeDesc = "Screen Print (Ink absorbed into fabric grain but with thick coverage, matte finish, slight texture)"; break;
            case 'rubber_press': typeDesc = "Rubber Press (Matte rubber surface, soft raised 3D effect, seamless edges)"; break;
            default: typeDesc = "Standard Flat Print"; break;
        }
        printDescriptions += `- Graphic Layer #${index + 1}: Apply ${typeDesc}. Ensure lighting interacts with this specific texture (shadows/highlights).\n`;
    }
  });

  const isMaterialChange = renderSettings.materialMode === 'custom' && renderSettings.customMaterialDescription.trim().length > 0;
  const materialPrompt = !isMaterialChange
    ? "BASE PRESERVATION (HIGHEST PRIORITY): You are acting as a PHOTO COMPOSITOR, NOT A GENERATOR. You must NOT redraw, regenerate, or alter the base garment form, shape, wrinkles, or fabric texture. The base image is the ABSOLUTE GROUND TRUTH. Your ONLY job is to blend the overlaid graphics realistically."
    : `BASE MATERIAL CHANGE: Change the garment material to: ${renderSettings.customMaterialDescription}. However, you MUST KEEP the original shape geometry and fold patterns 100% identical.`;

  return `
    Role: Expert Photo Compositor & Retoucher.
    Task: Realistic integration of graphic overlays onto a base garment.
    
    STRICT CONSTRAINT CHECKLIST:
    [x] DO NOT change the camera angle.
    [x] DO NOT change the garment silhouette (shape/form).
    [x] DO NOT change the background.
    [x] DO NOT add new elements other than the provided graphics.
    [ ] Blend the graphics: Graphics must follow the curvature and wrinkles of the fabric underneath.
    [ ] Apply Shading: Add shadows/highlights to the graphics matching the scene lighting.
    
    PRINTING TECHNIQUE SPECIFICATIONS (Apply these textures to the graphics only):
    ${printDescriptions}
    
    ${materialPrompt}
    
    Output Quality: ${config.resolution} Photorealistic, Pixel-Perfect precision for the base.
  `;
};

export const getLookbookPrompt = (
  concept: string,
  angleDesc: string,
  hasMixMatch: boolean,
  hasModelReference: boolean,
  modelDesc: string = "Professional Fashion Model",
  refineInstruction: string = "" 
) => {
  let mixInstruction = "";
  if (hasMixMatch) {
    mixInstruction = `
      **ACCESSORIES & STYLING INSTRUCTION (IMAGES PROVIDED):**
      - The user has provided additional images of ACCESSORIES (e.g., shoes, bags, hats, glasses, bottom-wear).
      - **ACTION**: You must "dress" the model with these exact items.
      - **INTEGRATION**: Ensure these accessories fit the model naturally (correct perspective, lighting, and sizing).
      - **COHERENCE**: The style of the accessories should blend with the main product to create a complete outfit.
    `;
  }

  let modelInstruction = `
    **MODEL GENERATION**:
    - Subject: ${modelDesc}.
    - Skin Texture: Ultra-realistic, visible pores, natural skin variation (not plastic/smooth).
    - Lighting on Face: Must match the scene (${concept}).
  `;

  if (hasModelReference) {
    modelInstruction = `
      **IDENTITY PRESERVATION (CRITICAL - FACE LOCK):**
      - **SOURCE**: Use the facial features, ethnicity, age, hair color, and body type from the MODEL REFERENCE IMAGE.
      - **ACTION**: Reconstruct this EXACT person in the new pose defined below.
      - **CONSISTENCY**: The face MUST look identical to the reference image. Preserve unique features like moles, jawline shape, and eye color.
      - **EXPRESSION**: Adapt the facial expression to fit the mood of the pose, but keep the identity locked.
    `;
  }

  let refinementPrompt = "";
  if (refineInstruction && refineInstruction.trim().length > 0) {
      refinementPrompt = `
      **USER REFINEMENT INSTRUCTION (HIGHEST PRIORITY):**
      - The user wants to adjust the specific output with this note: "${refineInstruction}".
      - **ACTION**: Apply this specific instruction over general rules. For example, if they ask for a specific hand gesture or background detail, DO IT.
      `;
  }

  return `
      SYSTEM MODE: HIGH-FIDELITY VIRTUAL TRY-ON (COMMERCIAL FASHION CAMPAIGN)
      
      INPUT DATA:
      - **IMAGE 1 (MAIN PRODUCT)**: The clothing item to be showcased. [KEEP DESIGN EXACT]
      - **IMAGE 2...N (ACCESSORIES/MODEL REF)**: Supplementary items or Model Identity.
      
      TARGET SPECIFICATIONS:
      - **CONCEPT/VIBE**: ${concept}.
      - **POSE/ACTION**: ${angleDesc}.
      
      ${refinementPrompt}

      EXECUTION RULES:
      1. **GARMENT FIDELITY**: The Main Product must be rendered with 100% accuracy in terms of fabric texture, logo placement, and cut. Warp it naturally around the model's body in the requested pose.
      
      2. **PHOTOREALISM**:
         - Use "Editorial Photography" aesthetic.
         - Depth of Field: Shallow depth of field (f/2.8) to separate model from background slightly.
         - Lighting: Commercial fashion lighting (Butterfly or Rembrandt).
         - Shadows: Realistic contact shadows where clothes touch skin or floor.
      
      ${modelInstruction}
      
      ${mixInstruction}
      
      NEGATIVE CONSTRAINTS:
      - Plastic skin, cartoon look, low resolution, bad anatomy, extra fingers.
      - Changing the design of the Main Product.
      
      Output: 4K Resolution, Raw Photography Style.
    `;
};

export const getVirtualTryOnPrompt = (
  backgroundMode: 'original' | 'change',
  backgroundDescription: string,
  hasAccessories: boolean
) => {
  return `
    SYSTEM ROLE: EXPERT VIRTUAL TRY-ON AI (VTON).
    
    **CRITICAL MISSION**: You are receiving a MODEL PHOTO (Image 1), a GARMENT PHOTO (Image 2), and optionally ACCESSORIES. Your task is to digitally dress the model in Image 1 with the items in Image 2, while preserving the model's identity perfectly.

    **STRICT CONSTRAINT CHECKLIST (DO NOT BREAK):**
    1.  **[CRITICAL] FACE & BODY INTEGRITY**:
        - You MUST NOT regenerate the face. The face in the output MUST be pixel-perfect identical to Image 1.
        - You MUST NOT change the body shape, skin tone, or pose of the model in Image 1.
        - Only replace the pixels where the clothing covers the body.

    2.  **GARMENT TRANSFER**:
        - Take the garment from Image 2 (and accessories if present).
        - Morph and warp it naturally to fit the model's pose in Image 1.
        - Preserve fabric texture, logos, prints, and details from the garment image.
        - Create realistic folds, wrinkles, and shadows based on the model's body volume.

    ${backgroundMode === 'original' 
      ? `3. **BACKGROUND PRESERVATION**:
         - **KEEP THE ORIGINAL BACKGROUND**. Do not change the environment.
         - Only update the lighting/shadows on the clothes to match the original scene.`
      : `3. **BACKGROUND REPLACEMENT**:
         - Remove the original background.
         - Generate a new background based on this description: "${backgroundDescription}".
         - **IMPORTANT**: Adjust the lighting on the MODEL and CLOTHES to match this new environment so it looks realistic (compositing).`}

    ${hasAccessories ? '4. **ACCESSORIES**: Add the provided accessories (hats, bags, jewelry) naturally to the model.' : ''}

    **OUTPUT QUALITY**: 4K Photorealistic. No "AI Blur". Sharp details.
  `;
};

export const getConceptProductPrompt = (
  description: string,
  hasStyleRef: boolean,
  config: GenConfig
) => {
  return `
    SYSTEM ROLE: Commercial Product Photographer & Art Director.

    INPUT DATA:
    - **IMAGE 1 (MAIN PRODUCT)**: [HARD CONSTRAINT] The physical product to be photographed. You must PRESERVE its identity, logo, and shape.
    ${hasStyleRef ? '- **IMAGE 2 (STYLE REFERENCE)**: [SOFT CONSTRAINT] The mood board. Extract lighting, background texture, and composition vibe.' : ''}

    TASK:
    - Place the product from Image 1 into a new environment defined by ${hasStyleRef ? 'Image 2 and ' : ''}the text prompt.
    - **PROMPT**: "${description}"

    EXECUTION RULES:
    1. **COMPOSITION**: Center the product or use Rule of Thirds based on the vibe.
    2. **LIGHTING & BLENDING**:
       - Create realistic cast shadows (contact shadows) where the product touches the surface.
       - Match the light direction of the new environment.
       - If the surface is reflective, generate accurate reflections of the product.
    3. **STYLE TRANSFER** (if Ref provided):
       - If Ref shows a nature vibe, use organic light and textures.
       - If Ref shows a neon/cyberpunk vibe, use colored rim lights.
    
    OUTPUT: Photorealistic, High-End Commercial Photography, ${config.resolution}.
  `;
};
