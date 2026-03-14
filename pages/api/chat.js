import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getSysPrompt(serviceId) {
  const map = {
    "3d": {
      l: "Impresión 3D",
      f: "material (PLA/ABS/PETG/resina/nylon), tecnología (FDM/SLA/SLS), dimensiones en mm, cantidad, acabado, tolerancias, color, archivo 3D disponible, uso final",
    },
    cnc: {
      l: "CNC Mecanizado",
      f: "material, operaciones (fresado/torneado/taladrado), dimensiones en mm, tolerancias, acabado superficial, cantidad, planos disponibles, uso final",
    },
    laser: {
      l: "Corte y Grabado Láser",
      f: "material, espesor en mm, dimensiones, operación (corte/grabado/ambos), archivo disponible, cantidad, acabado, uso final",
    },
    injection: {
      l: "Inyección Plástica",
      f: "tipo de plástico, dimensiones en mm, cantidad mínima, molde propio o nuevo, colores, archivo CAD disponible, propiedades especiales",
    },
  };
  const s = map[serviceId] || map["3d"];
  return `Eres asistente técnico de FabMarket, plataforma de manufactura en Lima, Perú. Eres experto en ${s.l}.
Recopila información para que los talleres puedan cotizar con precisión.
DATOS NECESARIOS: ${s.f}.
Sé conversacional y amigable en español de Perú. Máximo 2-3 preguntas por turno. Ayuda si el cliente no sabe algún dato técnico.
Cuando tengas TODA la información esencial (mínimo 6 campos), genera exactamente:
\`\`\`json
{"titulo":"...","descripcion_tecnica":"...","especificaciones":{"material":"...","cantidad":"...","dimensiones":"...","acabado":"...","tolerancias":"...","archivo_disponible":true},"uso_final":"..."}
\`\`\`
Luego di: "✅ Brief listo. Haz clic en **Publicar Pedido** para recibir ofertas de talleres."`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, serviceId } = req.body;

  if (!messages || !serviceId) {
    return res.status(400).json({ error: "Missing messages or serviceId" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: getSysPrompt(serviceId),
      messages,
    });

    res.status(200).json({ content: response.content });
  } catch (error) {
    console.error("Anthropic error:", error);
    res.status(500).json({ error: "Error al conectar con el asistente." });
  }
}
