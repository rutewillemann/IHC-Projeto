// base de categorias, regioes e pontos de apoio de sao paulo
// dados estruturados para funcionamento leve e sem servidor pago

const CATEGORIES = {
  alimentacao: {
    id: "alimentacao",
    label: "Alimentação",
    subtitle: "Refeições gratuitas ou a R$ 1,00 e distribuição de cestas"
  },
  moradia: {
    id: "moradia",
    label: "Moradia e Abrigo",
    subtitle: "Centros de acolhida, pernoite, banho e abrigo gratuito"
  },
  documentacao: {
    id: "documentacao",
    label: "Documentação",
    subtitle: "Emissão gratuita de RG, CPF, CadÚnico e segunda via"
  },
  saude: {
    id: "saude",
    label: "Saúde",
    subtitle: "Unidades Básicas de Saúde (UBS), vacinas e remédios gratuitos"
  },
  vestuario: {
    id: "vestuario",
    label: "Vestuário",
    subtitle: "Doação gratuita de roupas, agasalhos, calçados e cobertores"
  },
  apoio: {
    id: "apoio",
    label: "Apoio Social",
    subtitle: "CRAS, CREAS, auxílio social e encaminhamento a benefícios"
  }
};

// coordenadas centrais de referencia por regiao de sao paulo
const REGIONS = {
  zona_leste: {
    name: "Zona Leste (Itaquera / São Mateus)",
    lat: -23.5425,
    lng: -46.4710
  },
  centro: {
    name: "Centro (Sé / República)",
    lat: -23.5505,
    lng: -46.6333
  },
  zona_sul: {
    name: "Zona Sul (Santo Amaro)",
    lat: -23.6528,
    lng: -46.7062
  },
  zona_norte: {
    name: "Zona Norte (Santana)",
    lat: -23.5015,
    lng: -46.6248
  },
  zona_oeste: {
    name: "Zona Oeste (Lapa)",
    lat: -23.5228,
    lng: -46.7019
  }
};

// horario de funcionamento: openHour e closeHour em formato 24h (ex: 7 a 19)
// days: array com dias da semana (0 = domingo ... 6 = sabado)
const SUPPORT_PLACES = [
  // alimentacao
  {
    id: "bom-prato-itaquera",
    name: "Bom Prato Itaquera",
    type: "Equipamento Público",
    categories: ["alimentacao"],
    address: "Rua Victório Santim, 247 - Itaquera, São Paulo - SP",
    reference: "Próximo à Praça da Estação de Itaquera",
    phone: "1120794328",
    phoneDisplay: "(11) 2079-4328",
    lat: -23.5396,
    lng: -46.4562,
    hoursText: "Segunda a sábado, das 07:00 às 19:00 (Café, Almoço e Jantar)",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5, 6],
    services: [
      "Café da manhã a R$ 0,50 (a partir das 07:00)",
      "Almoço completo a R$ 1,00 (a partir das 10:30)",
      "Jantar a R$ 1,00 (a partir das 17:00)",
      "Gratuito para pessoas cadastradas no CadÚnico em situação de rua"
    ],
    documents: "Não é obrigatório levar documento para refeição. Para isenção total, informe seu nome no cadastro do local ou leve o cartão do CadÚnico se tiver."
  },
  {
    id: "bom-prato-sao-mateus",
    name: "Bom Prato São Mateus",
    type: "Equipamento Público",
    categories: ["alimentacao"],
    address: "Av. Mateo Bei, 2604 - São Mateus, São Paulo - SP",
    reference: "Na avenida principal, perto do Terminal São Mateus",
    phone: "1120194128",
    phoneDisplay: "(11) 2019-4128",
    lat: -23.6085,
    lng: -46.4785,
    hoursText: "Segunda a sábado, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5, 6],
    services: [
      "Café da manhã, almoço e jantar nutritivos",
      "Atendimento prioritário para idosos e gestantes",
      "Marmitas disponíveis para levar"
    ],
    documents: "Não precisa de documento. Chegue cedo nos horários de pico (11:00 às 13:00)."
  },
  {
    id: "bom-prato-guaianases",
    name: "Bom Prato Guaianases",
    type: "Equipamento Público",
    categories: ["alimentacao"],
    address: "Estrada de Poá, 13 - Guaianases, São Paulo - SP",
    reference: "Ao lado da Estação Guaianases da CPTM",
    phone: "1125573310",
    phoneDisplay: "(11) 2557-3310",
    lat: -23.5422,
    lng: -46.4150,
    hoursText: "Segunda a sábado, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5, 6],
    services: [
      "Café da manhã, almoço e jantar diários",
      "Espaço com acessibilidade e mesas amplas"
    ],
    documents: "Não exige documento para entrar."
  },
  {
    id: "bom-prato-25-marco",
    name: "Bom Prato 25 de Março",
    type: "Equipamento Público",
    categories: ["alimentacao"],
    address: "Rua 25 de Março, 166 - Centro, São Paulo - SP",
    reference: "Perto do Parque Dom Pedro II",
    phone: "1131072680",
    phoneDisplay: "(11) 3107-2680",
    lat: -23.5476,
    lng: -46.6305,
    hoursText: "Todos os dias, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [0, 1, 2, 3, 4, 5, 6],
    services: [
      "Café da manhã, almoço e jantar todos os dias da semana",
      "Atendimento rápido para famílias e idosos"
    ],
    documents: "Não é necessário apresentar documento."
  },
  {
    id: "cozinha-solidaria-leste",
    name: "Cozinha Solidária Vila Jacuí",
    type: "ONG / Projeto Social",
    categories: ["alimentacao", "vestuario"],
    address: "Rua São Gonçalo do Rio das Pedras, 810 - Vila Jacuí, São Paulo - SP",
    reference: "Próximo à Praça do Forró em São Miguel",
    phone: "11984210012",
    phoneDisplay: "(11) 98421-0012",
    lat: -23.5021,
    lng: -46.4620,
    hoursText: "Segunda a sexta, das 10:00 às 15:00",
    openHour: 10,
    closeHour: 15,
    days: [1, 2, 3, 4, 5],
    services: [
      "Marmitas 100% gratuitas distribuídas a partir das 11:30",
      "Doação de legumes, frutas e cestas básicas conforme disponibilidade",
      "Varal solidário gratuito com roupas e calçados"
    ],
    documents: "Não exige documento para retirar marmita ou roupas. Para cadastro de cesta mensal, leve RG ou CPF se tiver."
  },
  {
    id: "bom-prato-santo-amaro",
    name: "Bom Prato Santo Amaro",
    type: "Equipamento Público",
    categories: ["alimentacao"],
    address: "Av. Mário Lopes Leão, 685 - Santo Amaro, São Paulo - SP",
    reference: "Próximo ao Terminal Santo Amaro",
    phone: "1156862340",
    phoneDisplay: "(11) 5686-2340",
    lat: -23.6512,
    lng: -46.7095,
    hoursText: "Segunda a sábado, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5, 6],
    services: [
      "Café da manhã, almoço e jantar populares",
      "Atendimento gratuito para pessoas em vulnerabilidade cadastradas"
    ],
    documents: "Não exige documento."
  },
  {
    id: "bom-prato-santana",
    name: "Bom Prato Santana",
    type: "Equipamento Público",
    categories: ["alimentacao"],
    address: "Rua Dr. Zuquim, 532 - Santana, São Paulo - SP",
    reference: "A 5 minutos a pé do Metrô Santana",
    phone: "1129795220",
    phoneDisplay: "(11) 2979-5220",
    lat: -23.5028,
    lng: -46.6254,
    hoursText: "Segunda a sábado, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5, 6],
    services: [
      "Café da manhã, almoço e jantar diários",
      "Prioridade para pessoas idosas e gestantes"
    ],
    documents: "Não precisa de documento."
  },
  {
    id: "bom-prato-lapa",
    name: "Bom Prato Lapa",
    type: "Equipamento Público",
    categories: ["alimentacao"],
    address: "Rua Afonso Sardinha, 245 - Lapa, São Paulo - SP",
    reference: "Perto do Mercado Municipal da Lapa",
    phone: "1138316415",
    phoneDisplay: "(11) 3831-6415",
    lat: -23.5210,
    lng: -46.7042,
    hoursText: "Segunda a sábado, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5, 6],
    services: [
      "Refeições nutritivas de segunda a sábado",
      "Marmitas para viagem disponíveis"
    ],
    documents: "Não precisa de documento."
  },

  // vestuario
  {
    id: "bazar-solidario-itaquera",
    name: "Casa Solidária de Itaquera (Roupas e Cestas)",
    type: "ONG / Projeto Social",
    categories: ["vestuario", "alimentacao"],
    address: "Rua Américo Salvador Novelli, 390 - Itaquera, São Paulo - SP",
    reference: "Perto da Praça da Matriz de Itaquera",
    phone: "1120714490",
    phoneDisplay: "(11) 2071-4490",
    lat: -23.5418,
    lng: -46.4588,
    hoursText: "Segunda a sexta, das 09:00 às 17:00",
    openHour: 9,
    closeHour: 17,
    days: [1, 2, 3, 4, 5],
    services: [
      "Retirada gratuita de roupas adultas e infantis",
      "Doação de calçados, agasalhos e cobertores",
      "Apoio emergencial com alimentos secos"
    ],
    documents: "Não é obrigatório levar documento. Basta conversar com a recepção na entrada."
  },
  {
    id: "nucleo-vestuario-penha",
    name: "Projeto Mãos Abertas - Penha",
    type: "ONG / Projeto Social",
    categories: ["vestuario", "apoio"],
    address: "Rua Doutor João Ribeiro, 215 - Penha, São Paulo - SP",
    reference: "Próximo à Igreja Nossa Senhora da Penha",
    phone: "1126418820",
    phoneDisplay: "(11) 2641-8820",
    lat: -23.5236,
    lng: -46.5442,
    hoursText: "Terça a sábado, das 09:00 às 16:00",
    openHour: 9,
    closeHour: 16,
    days: [2, 3, 4, 5, 6],
    services: [
      "Doação gratuita de roupas, meias e sapatos",
      "Kits de higiene pessoal gratuitos",
      "Escuta acolhedora e orientação para emprego"
    ],
    documents: "Atendimento livre sem necessidade de documento."
  },
  {
    id: "arsenal-esperanca-bras",
    name: "Arsenal da Esperança (Roupas e Acolhida)",
    type: "ONG / Projeto Social",
    categories: ["vestuario", "moradia", "alimentacao"],
    address: "Rua Doutor Almeida Lima, 900 - Mooca/Brás, São Paulo - SP",
    reference: "Perto do Metrô Bresser-Mooca",
    phone: "1122920977",
    phoneDisplay: "(11) 2292-0977",
    lat: -23.5489,
    lng: -46.6114,
    hoursText: "Todos os dias, 24 horas (recepção diurna das 08:00 às 18:00)",
    openHour: 0,
    closeHour: 24,
    days: [0, 1, 2, 3, 4, 5, 6],
    services: [
      "Acolhimento com cama, banho quente e refeições",
      "Doação de roupas limpas e calçados",
      "Apoio social e cursos gratuitos"
    ],
    documents: "Se tiver RG ou CPF, leve. Se perdeu os documentos, você é atendido mesmo assim e recebe ajuda para tirar novos."
  },
  {
    id: "roupa-solidaria-sul",
    name: "Espaço Acolher Santo Amaro",
    type: "ONG / Projeto Social",
    categories: ["vestuario", "alimentacao"],
    address: "Rua Barão do Rio Branco, 420 - Santo Amaro, São Paulo - SP",
    reference: "Próximo ao Largo Treze de Maio",
    phone: "1155231940",
    phoneDisplay: "(11) 5523-1940",
    lat: -23.6540,
    lng: -46.7078,
    hoursText: "Segunda a sexta, das 09:00 às 17:00",
    openHour: 9,
    closeHour: 17,
    days: [1, 2, 3, 4, 5],
    services: [
      "Doação de roupas masculinas, femininas e infantis",
      "Cobertores e kits de higiene",
      "Café comunitário pela manhã"
    ],
    documents: "Não exige documento."
  },

  // moradia / acolhimento
  {
    id: "centro-acolhida-itaquera",
    name: "Centro de Acolhida Especial Itaquera",
    type: "Equipamento Público",
    categories: ["moradia", "alimentacao"],
    address: "Rua Sabbado D'Angelo, 1180 - Itaquera, São Paulo - SP",
    reference: "Fácil acesso pela Av. Pires do Rio",
    phone: "1120561840",
    phoneDisplay: "(11) 2056-1840",
    lat: -23.5354,
    lng: -46.4530,
    hoursText: "Aberto todos os dias, 24 horas",
    openHour: 0,
    closeHour: 24,
    days: [0, 1, 2, 3, 4, 5, 6],
    services: [
      "Pernoite gratuito com cama e cobertor",
      "Banho quente e lavanderia",
      "Café da manhã e jantar gratuitos",
      "Acompanhamento de assistente social"
    ],
    documents: "Não precisa ter documento para ser acolhido. A equipe ajuda na emissão de novos documentos."
  },
  {
    id: "centro-acolhida-se",
    name: "Centro de Acolhida Barra Funda / Centro",
    type: "Equipamento Público",
    categories: ["moradia"],
    address: "Rua Norma Pieruccini Giannotti, 77 - Barra Funda, São Paulo - SP",
    reference: "Próximo ao Terminal Barra Funda",
    phone: "1133921540",
    phoneDisplay: "(11) 3392-1540",
    lat: -23.5262,
    lng: -46.6540,
    hoursText: "Aberto todos os dias, 24 horas",
    openHour: 0,
    closeHour: 24,
    days: [0, 1, 2, 3, 4, 5, 6],
    services: [
      "Abrigo temporário e pernoite gratuito",
      "Espaço seguro para guardar pertences",
      "Higiene pessoal e orientação social"
    ],
    documents: "Acolhimento garantido mesmo sem documentos. Leve RG ou CPF apenas se possuir."
  },
  {
    id: "nucleo-convivencia-lapa",
    name: "Núcleo de Convivência e Banho Lapa",
    type: "Equipamento Público",
    categories: ["moradia", "vestuario"],
    address: "Rua Guaicurus, 510 - Lapa, São Paulo - SP",
    reference: "Perto da Estação Lapa",
    phone: "1138624410",
    phoneDisplay: "(11) 3862-4410",
    lat: -23.5238,
    lng: -46.6980,
    hoursText: "Todos os dias, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [0, 1, 2, 3, 4, 5, 6],
    services: [
      "Banho quente e troca de roupas gratuitas",
      "Lavagem de roupas e descanso durante o dia",
      "Encaminhamento para vaga de pernoite"
    ],
    documents: "Não exige documento."
  },

  // documentacao
  {
    id: "descomplica-itaquera",
    name: "Descomplica SP - Itaquera",
    type: "Equipamento Público",
    categories: ["documentacao", "apoio"],
    address: "Rua Augusto Carlos Bauman, 851 - Itaquera, São Paulo - SP",
    reference: "Junto à Subprefeitura de Itaquera",
    phone: "156",
    phoneDisplay: "156 (Ligação gratuita)",
    lat: -23.5390,
    lng: -46.4535,
    hoursText: "Segunda a sexta, das 08:00 às 17:00",
    openHour: 8,
    closeHour: 17,
    days: [1, 2, 3, 4, 5],
    services: [
      "Atualização e inscrição no CadÚnico",
      "Orientação para segunda via gratuita de RG, CPF e Certidão",
      "Bilhete Único Especial e Idoso",
      "Auxílio presencial para quem tem dificuldade com internet"
    ],
    documents: "Leve um documento com foto (se tiver) e comprovante de endereço. Se não tiver documentos, explique na recepção para receber declaração de gratuidade."
  },
  {
    id: "descomplica-sao-mateus",
    name: "Descomplica SP - São Mateus",
    type: "Equipamento Público",
    categories: ["documentacao"],
    address: "Av. Ragueb Chohfi, 1400 - São Mateus, São Paulo - SP",
    reference: "No prédio da Subprefeitura de São Mateus",
    phone: "156",
    phoneDisplay: "156 (Ligação gratuita)",
    lat: -23.5972,
    lng: -46.4730,
    hoursText: "Segunda a sexta, das 08:00 às 17:00",
    openHour: 8,
    closeHour: 17,
    days: [1, 2, 3, 4, 5],
    services: [
      "Emissão de documentos e CadÚnico",
      "Atendimento para Bolsa Família e BPC",
      "Apoio com serviços digitais da prefeitura"
    ],
    documents: "Leve RG, CPF e certidão de nascimento se possuir."
  },
  {
    id: "poupatempo-se",
    name: "Poupatempo Sé",
    type: "Equipamento Público",
    categories: ["documentacao"],
    address: "Praça do Carmo, s/n - Sé, São Paulo - SP",
    reference: "A 3 minutos do Metrô Sé",
    phone: "1141359700",
    phoneDisplay: "(11) 4135-9700",
    lat: -23.5513,
    lng: -46.6318,
    hoursText: "Segunda a sexta das 07:00 às 19:00 | Sábado das 07:00 às 13:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5, 6],
    services: [
      "Emissão de RG / Carteira de Identidade Nacional",
      "CPF e Carteira de Trabalho Digital",
      "Isenção de taxa para pessoas em situação de vulnerabilidade"
    ],
    documents: "Leve certidão de nascimento ou casamento (original ou cópia legível). Caso não possua, peça orientação no balcão de assistência social."
  },

  // saude
  {
    id: "ubs-itaquera",
    name: "UBS Itaquera",
    type: "Equipamento Público (SUS)",
    categories: ["saude"],
    address: "Rua Américo Salvador Novelli, 265 - Itaquera, São Paulo - SP",
    reference: "Próximo à Praça da Estação",
    phone: "1120713920",
    phoneDisplay: "(11) 2071-3920",
    lat: -23.5408,
    lng: -46.4576,
    hoursText: "Segunda a sexta, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5],
    services: [
      "Consultas médicas e de enfermagem gratuitas pelo SUS",
      "Retirada gratuita de remédios na farmácia da unidade",
      "Vacinação, curativos e aferição de pressão"
    ],
    documents: "Leve Cartão do SUS ou CPF se tiver. Em caso de necessidade urgente, o atendimento é garantido mesmo sem documentos."
  },
  {
    id: "ubs-se",
    name: "UBS Sé",
    type: "Equipamento Público (SUS)",
    categories: ["saude"],
    address: "Rua Frederico Alvarenga, 259 - Sé, São Paulo - SP",
    reference: "Próximo ao Parque Dom Pedro II",
    phone: "1131018830",
    phoneDisplay: "(11) 3101-8830",
    lat: -23.5518,
    lng: -46.6289,
    hoursText: "Segunda a sexta, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5],
    services: [
      "Consultas clínicas, odontologia e vacinas",
      "Farmácia gratuita com medicamentos básicos",
      "Equipe Consultório na Rua"
    ],
    documents: "Cartão SUS ou RG se possuir. Pessoas sem documento também são atendidas normalmente."
  },
  {
    id: "ubs-santo-amaro",
    name: "UBS Santo Amaro - Dr. Sérgio Villaca Braga",
    type: "Equipamento Público (SUS)",
    categories: ["saude"],
    address: "Rua Conde de Itu, 359 - Santo Amaro, São Paulo - SP",
    reference: "Próximo ao Metrô Adolfo Pinheiro",
    phone: "1155221840",
    phoneDisplay: "(11) 5522-1840",
    lat: -23.6495,
    lng: -46.7031,
    hoursText: "Segunda a sexta, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5],
    services: [
      "Consultas gratuitas e acompanhamento de saúde",
      "Entrega gratuita de remédios com receita do SUS",
      "Curativos e exames preventivos"
    ],
    documents: "Documento com foto ou Cartão do SUS (se tiver)."
  },
  {
    id: "ubs-santana",
    name: "UBS Santana",
    type: "Equipamento Público (SUS)",
    categories: ["saude"],
    address: "Rua Voluntários da Pátria, 1550 - Santana, São Paulo - SP",
    reference: "Perto do Metrô Santana",
    phone: "1129794210",
    phoneDisplay: "(11) 2979-4210",
    lat: -23.5042,
    lng: -46.6251,
    hoursText: "Segunda a sexta, das 07:00 às 19:00",
    openHour: 7,
    closeHour: 19,
    days: [1, 2, 3, 4, 5],
    services: [
      "Atendimento médico e acolhimento de enfermagem",
      "Vacinação e farmácia popular da UBS"
    ],
    documents: "Leve CPF ou Cartão do SUS se possuir."
  },

  // apoio social (cras / creas)
  {
    id: "cras-itaquera",
    name: "CRAS Itaquera",
    type: "Equipamento Público (CRAS)",
    categories: ["apoio", "documentacao"],
    address: "Rua Sábbado D'Angelo, 1044 - Itaquera, São Paulo - SP",
    reference: "Próximo ao centro comercial de Itaquera",
    phone: "1120798120",
    phoneDisplay: "(11) 2079-8120",
    lat: -23.5368,
    lng: -46.4545,
    hoursText: "Segunda a sexta, das 08:00 às 17:00",
    openHour: 8,
    closeHour: 17,
    days: [1, 2, 3, 4, 5],
    services: [
      "Cadastro Único (CadÚnico) para Bolsa Família e Tarifa Social",
      "Orientação para benefício BPC para idosos e pessoas com deficiência",
      "Atendimento com assistente social e psicólogo",
      "Encaminhamento para cesta básica e auxílios"
    ],
    documents: "Leve RG, CPF e comprovante de residência se tiver. Se faltarem documentos, a assistente social orienta como conseguir de graça."
  },
  {
    id: "creas-se",
    name: "CREAS Sé",
    type: "Equipamento Público (CREAS)",
    categories: ["apoio", "moradia"],
    address: "Rua Otto de Alencar, 270 - Cambuci/Sé, São Paulo - SP",
    reference: "Próximo à Praça da Sé e Lavapés",
    phone: "1132074280",
    phoneDisplay: "(11) 3207-4280",
    lat: -23.5582,
    lng: -46.6255,
    hoursText: "Segunda a sexta, das 08:00 às 18:00",
    openHour: 8,
    closeHour: 18,
    days: [1, 2, 3, 4, 5],
    services: [
      "Apoio especializado para famílias e pessoas em situação de risco",
      "Orientação jurídica e encaminhamento para abrigos",
      "Apoio psicossocial gratuito"
    ],
    documents: "Não exige documento para o primeiro acolhimento."
  },
  {
    id: "cras-santo-amaro",
    name: "CRAS Santo Amaro",
    type: "Equipamento Público (CRAS)",
    categories: ["apoio", "documentacao"],
    address: "Rua Capitão Tiago Luz, 128 - Santo Amaro, São Paulo - SP",
    reference: "Próximo ao Largo Treze",
    phone: "1155243190",
    phoneDisplay: "(11) 5524-3190",
    lat: -23.6533,
    lng: -46.7051,
    hoursText: "Segunda a sexta, das 08:00 às 17:00",
    openHour: 8,
    closeHour: 17,
    days: [1, 2, 3, 4, 5],
    services: [
      "Inscrição e atualização do CadÚnico",
      "Acompanhamento de famílias em vulnerabilidade",
      "Encaminhamento para cursos gratuitos e benefícios"
    ],
    documents: "RG ou CPF se possuir. Atendimento garantido mesmo sem comprovante de residência."
  },
  {
    id: "cras-lapa",
    name: "CRAS Lapa",
    type: "Equipamento Público (CRAS)",
    categories: ["apoio"],
    address: "Rua Caio Graco, 415 - Vila Romana/Lapa, São Paulo - SP",
    reference: "Próximo à Rua Clélia",
    phone: "1138712460",
    phoneDisplay: "(11) 3871-2460",
    lat: -23.5270,
    lng: -46.6952,
    hoursText: "Segunda a sexta, das 08:00 às 17:00",
    openHour: 8,
    closeHour: 17,
    days: [1, 2, 3, 4, 5],
    services: [
      "Orientação sobre benefícios sociais e CadÚnico",
      "Apoio para idosos e famílias",
      "Encaminhamento para assistência alimentar"
    ],
    documents: "Leve um documento pessoal se tiver."
  }
];
