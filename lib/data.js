export const SERVICES = [
  {
    id: "3d",
    name: "Impresión 3D",
    desc: "FDM, SLA, SLS y más tecnologías de manufactura aditiva",
    color: "#D97706",
    colorDim: "#3A2A00",
    colorBg: "#1A1200",
    icon: "▲",
  },
  {
    id: "cnc",
    name: "CNC Mecanizado",
    desc: "Fresado, torneado y corte de precisión en metal, madera y más",
    color: "#3B82F6",
    colorDim: "#0A1A3A",
    colorBg: "#050D20",
    icon: "⚙",
  },
  {
    id: "laser",
    name: "Corte y Grabado Láser",
    desc: "CO₂, fibra y diodo — corte y grabado de alta precisión",
    color: "#8B5CF6",
    colorDim: "#1A0A3A",
    colorBg: "#0D0520",
    icon: "◈",
  },
  {
    id: "injection",
    name: "Inyección Plástica",
    desc: "Diseño de moldes y producción en serie de piezas plásticas",
    color: "#10B981",
    colorDim: "#0A2A1A",
    colorBg: "#041510",
    icon: "◉",
  },
];

export const DEMO_USERS = [
  { id: "c1", type: "client", name: "Carlos Mendoza" },
  {
    id: "w1",
    type: "workshop",
    name: "Roberto Silva",
    workshopName: "TechFab Lima",
    whatsapp: "51987654321",
    location: "Miraflores, Lima",
  },
  {
    id: "w2",
    type: "workshop",
    name: "Ana Torres",
    workshopName: "Innovaprint 3D",
    whatsapp: "51976543210",
    location: "San Isidro, Lima",
  },
  {
    id: "w3",
    type: "workshop",
    name: "Miguel Pérez",
    workshopName: "MetalWorks CNC",
    whatsapp: "51965432109",
    location: "La Victoria, Lima",
  },
];

export const DEMO_ORDERS = [
  {
    id: "ord-1",
    clientId: "c1",
    clientName: "Carlos Mendoza",
    service: null, // filled at runtime
    status: "open",
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    summary: {
      titulo: "Engranajes helicoidales para prototipo robótico",
      descripcion_tecnica:
        "Se requiere la fabricación de 5 engranajes helicoidales para un robot educativo universitario.",
      especificaciones: {
        material: "PLA+ negro",
        cantidad: "5 piezas",
        dimensiones: "Ø60mm y Ø40mm x 20mm",
        acabado: "Lijado leve",
        tolerancias: "±0.2mm",
      },
      uso_final: "Prototipo robot educativo",
    },
  },
];

export const DEMO_OFFERS = [
  {
    id: "off-1",
    orderId: "ord-1",
    workshopId: "w2",
    workshopName: "Innovaprint 3D",
    workshopWhatsapp: "51976543210",
    price: 85,
    deliveryDays: 3,
    message: "Bambu Lab X1C, precisión ±0.1mm. PLA+ ESUN negro.",
    location: "San Isidro, Lima",
    status: "pending",
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: "off-2",
    orderId: "ord-1",
    workshopId: "w1",
    workshopName: "TechFab Lima",
    workshopWhatsapp: "51987654321",
    price: 75,
    deliveryDays: 5,
    message: "Control de calidad incluido en todas las piezas.",
    location: "Miraflores, Lima",
    status: "pending",
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
];
