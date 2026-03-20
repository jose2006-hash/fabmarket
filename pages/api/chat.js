function getSysPrompt(serviceId) {
  const map = {
    "3d": { l: "Impresión 3D", f: "material (PLA/ABS/PETG/resina/nylon), tecnología (FDM/SLA/SLS), dimensiones en mm, cantidad, acabado, tolerancias, color, archivo 3D disponible, uso final" },
    cnc: { l: "CNC Mecanizado", f: "material, operaciones (fresado/torneado/taladrado), dimensiones en mm, tolerancias, acabado superficial, cantidad, planos disponibles, uso final" },
    laser: { l: "Corte y Grabado Láser", f: "material, espesor en mm, dimensiones, operación (corte/grabado/ambos), archivo disponible, cantidad, acabado, uso final" },
    injection: { l: "Inyección Plástica", f: "tipo de plástico, dimensiones en mm, cantidad mínima, molde propio o nuevo, colores, archivo CAD disponible, propiedades especiales" },
  };
  const s = map[serviceId] || map["3d"];
  return `Eres asistente técnico de FabMarket en Lima, Perú. Experto en ${s.l}. Datos necesarios: ${s.f}. Sé amigable, máximo 2-3 preguntas por turno. Cuando tengas toda la info genera: \`\`\`json\n{"titulo":"...","descripcion_tecnica":"...","especificaciones":{"material":"...","cantidad":"...","dimensiones":"...","acabado":"...","tolerancias":"...","archivo_disponible":true},"uso_final":"..."}\n\`\`\` Luego di: "✅ Brief listo. Haz clic en **Publicar Pedido**."`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, serviceId } = req.body;
  if (!messages || !serviceId) return res.status(400).json({ error: "Faltan datos" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [{ role: "system", content: getSysPrompt(serviceId) }, ...messages],
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || "Error OpenAI" });
    const reply = data.choices?.[0]?.message?.content || "Error al obtener respuesta.";
    res.status(200).json({ content: [{ text: reply }] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error de conexión." });
  }
}