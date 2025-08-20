import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Tooltip,
  Stack,
  LinearProgress,
  Link,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  Category as CategoryIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
  OpenInNew as OpenInNewIcon,
  ViewList as ViewListIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import "./App.css";

// FTE Code to Title mapping
const FTE_CODE_TITLES = {
  "1 – 1": "Pesquisa mineral com guia de utilização",
  "1 – 2":
    "Lavra a céu aberto, inclusive de aluvião, com ou sem beneficiamento",
  "1 – 3": "Lavra subterrânea com ou sem beneficiamento",
  "1 – 4": "Lavra garimpeira",
  "1 – 5": "Perfuração de poços e produção de petróleo e gás natural",
  "1 – 7":
    "Lavra garimpeira - Decreto nº 97.507/1989 - Utilização de mercúrio metálico",
  "2 – 1": "Beneficiamento de minerais não-metálicos não associados à extração",
  "2 – 2": "Fabricação e elaboração de produtos minerais não-metálicos",
  "3 – 1": "Fabricação de aço e de produtos siderúrgicos",
  "3 – 2": "Produção de fundidos de ferro e aço, forjados, arames, relaminados",
  "3 – 3":
    "Metalurgia dos metais não-ferrosos em formas primárias e secundárias",
  "3 – 4": "Produção de laminados, ligas, artefatos de metais não-ferrosos",
  "3 – 5": "Relaminagem de metais não-ferrosos, inclusive ligas",
  "3 – 6": "Produção de soldas e ânodos",
  "3 – 7": "Metalurgia de metais preciosos",
  "3 – 8": "Metalurgia do pó, inclusive peças moldadas",
  "3 – 9": "Fabricação de estruturas metálicas",
  "3 – 10": "Fabricação de artefatos de ferro, aço e metais não-ferrosos",
  "3 – 11": "Têmpera e cementação de aço, recozimento de arames",
  "3 – 12":
    "Metalurgia de metais preciosos - Decreto nº 97.634/1989 - Utilização de mercúrio metálico",
  "4 – 1": "Fabricação de máquinas, aparelhos, peças, utensílios e acessórios",
  "5 – 1": "Fabricação de pilhas, baterias e outros acumuladores",
  "5 – 2":
    "Fabricação de material elétrico, eletrônico e equipamentos para telecomunicação",
  "5 – 3": "Fabricação de aparelhos elétricos e eletrodomésticos",
  "5 – 4":
    "Fabricação de material elétrico, eletrônico e equipamentos para telecomunicação - Lei nº 12.305/2010",
  "6 – 1": "Fabricação e montagem de veículos rodoviários e ferroviários",
  "6 – 2": "Fabricação e montagem de aeronaves",
  "6 – 3": "Fabricação e reparo de embarcações e estruturas flutuantes",
  "7 – 1": "Serraria e desdobramento de madeira",
  "7 – 2": "Preservação de madeira",
  "7 – 3":
    "Fabricação de chapas, placas de madeira aglomerada, prensada e compensada",
  "7 – 4": "Fabricação de estruturas de madeira e móveis",
  "8 – 1": "Fabricação de celulose e pasta mecânica",
  "8 – 2": "Fabricação de papel e papelão",
  "8 – 3":
    "Fabricação de artefatos de papel, papelão, cartolina, cartão e fibra prensada",
  "9 – 1": "Beneficiamento de borracha natural",
  "9 – 3": "Fabricação de laminados e fios de borracha",
  "9 – 4": "Fabricação de espuma de borracha e artefatos de espuma de borracha",
  "9 – 5": "Fabricação de câmara de ar",
  "9 – 6": "Fabricação de pneumáticos",
  "9 – 7": "Recondicionamento de pneumáticos",
  "10 – 1": "Secagem e salga de couros e peles",
  "10 – 2": "Curtimento e outras preparações de couros e peles",
  "10 – 3": "Fabricação de artefatos diversos de couros e peles",
  "10 – 4": "Fabricação de cola animal",
  "11 – 1":
    "Beneficiamento de fibras têxteis vegetais, de origem animal e sintéticas",
  "11 – 2": "Fabricação e acabamento de fios e tecidos",
  "11 – 3": "Tingimento, estamparia e outros acabamentos em peças do vestuário",
  "11 – 4": "Fabricação de calçados e componentes para calçados",
  "12 – 1": "Fabricação de laminados plásticos",
  "12 – 2": "Fabricação de artefatos de material plástico",
  "13 – 1": "Fabricação de cigarros, charutos, cigarrilhas e outras atividades",
  "14 – 1": "Usinas de produção de concreto",
  "14 – 2": "Usinas de produção de asfalto",
  "15 – 1": "Produção de substâncias e fabricação de produtos químicos",
  "15 – 2":
    "Fabricação de produtos derivados do processamento de petróleo, de rochas betuminosas e da madeira",
  "15 – 3": "Fabricação de combustíveis não derivados de petróleo",
  "15 – 4": "Produção de óleos, gorduras, ceras vegetais e animais",
  "15 – 5": "Fabricação de resinas e de fibras e fios artificiais e sintéticos",
  "15 – 6":
    "Fabricação de pólvora, explosivos, detonantes, munição para caça e desporto",
  "15 – 7":
    "Recuperação e refino de solventes, óleos minerais, vegetais e animais",
  "15 – 8":
    "Fabricação de concentrados aromáticos naturais, artificiais e sintéticos",
  "15 – 9": "Fabricação de preparados para limpeza e polimento, desinfetantes",
  "15 – 10":
    "Fabricação de tintas, esmaltes, lacas, vernizes, impermeabilizantes",
  "15 – 11": "Fabricação de fertilizantes e agroquímicos",
  "15 – 12": "Fabricação de produtos farmacêuticos e veterinários",
  "15 – 13": "Fabricação de sabões, detergentes e velas",
  "15 – 14": "Fabricação de perfumarias e cosméticos",
  "15 – 15": "Produção de álcool etílico, metanol e similares",
  "15 – 17":
    "Produção de substâncias e fabricação de produtos químicos (preservativos de madeira)",
  "15 – 20":
    "Produção de substâncias e fabricação de produtos químicos (utilização de mercúrio metálico)",
  "15 – 21":
    "Produção de substâncias e fabricação de produtos químicos (remediador/dispersante químico)",
  "15 – 23":
    "Fabricação de produtos derivados do processamento de petróleo (rerrefino de óleo lubrificante usado)",
  "16 – 1":
    "Beneficiamento, moagem, torrefação e fabricação de produtos alimentares",
  "16 – 2":
    "Matadouros, abatedouros, frigoríficos, charqueadas e derivados de origem animal",
  "16 – 3": "Fabricação de conservas",
  "16 – 4": "Preparação de pescados e fabricação de conservas de pescados",
  "16 – 5": "Beneficiamento e industrialização de leite e derivados",
  "16 – 6": "Fabricação e refinação de açúcar",
  "16 – 7": "Refino e preparação de óleo e gorduras vegetais",
  "16 – 8":
    "Produção de manteiga, cacau, gorduras de origem animal para alimentação",
  "16 – 9": "Fabricação de fermentos e leveduras",
  "16 – 10":
    "Fabricação de rações balanceadas e de alimentos preparados para animais",
  "16 – 11": "Fabricação de vinhos e vinagre",
  "16 – 12": "Fabricação de cervejas, chopes e maltes",
  "16 – 13":
    "Fabricação de bebidas não alcoólicas, engarrafamento e gaseificação",
  "16 – 14": "Fabricação de bebidas alcoólicas",
  "16 – 15":
    "Matadouros, abatedouros, frigoríficos, charqueadas e derivados de origem animal (fauna silvestre/fauna exótica)",
  "16 – 16":
    "Matadouros, abatedouros, frigoríficos, charqueadas e derivados de origem animal (fauna silvestre/fauna exótica)",
  "17 – 1": "Produção de energia termoelétrica",
  "17 – 4":
    "Destinação de resíduos de esgotos sanitários e de resíduos sólidos urbanos",
  "17 – 5": "Dragagem e derrocamentos em corpos d'água",
  "17 – 57":
    "Tratamento e destinação de resíduos industriais líquidos e sólidos - Decreto nº 7.404/2010",
  "17 – 58":
    "Tratamento e destinação de resíduos industriais líquidos e sólidos - Lei nº 12.305/2010",
  "17 – 59":
    "Tratamento e destinação de resíduos industriais líquidos e sólidos - Lei nº 12.305/2010",
  "17 – 60":
    "Tratamento e destinação de resíduos industriais líquidos e sólidos - Lei nº 12.305/2010",
  "17 – 61": "Disposição de resíduos especiais - Lei nº 12.305/2010",
  "17 – 62": "Disposição de resíduos especiais - Lei nº 12.305/2010",
  "17 – 63": "Disposição de resíduos especiais - Lei nº 12.305/2010",
  "17 – 64": "Disposição de resíduos especiais - Lei nº 6.938/1981",
  "17 – 65": "Disposição de resíduos especiais - Lei nº 12.305/2010",
  "17 – 66": "Disposição de resíduos especiais (Protocolo de Montreal)",
  "17 – 67": "Recuperação de áreas degradadas",
  "17 – 68": "Recuperação de áreas contaminadas",
  "17 – 69":
    "Tratamento e destinação de resíduos industriais líquidos e sólidos - Lei Complementar nº 140/2011",
  "18 – 1": "Transporte de cargas perigosas",
  "18 – 2": "Transporte por dutos",
  "18 – 3": "Marinas, portos e aeroportos",
  "18 – 4": "Terminais de minério, petróleo e derivados e produtos químicos",
  "18 – 5": "Depósito de produtos químicos e produtos perigosos",
  "18 – 6": "Comércio de combustíveis e derivados de petróleo",
  "18 – 7": "Comércio de produtos químicos e produtos perigosos",
  "18 – 8":
    "Comércio de produtos químicos e produtos perigosos - Decreto nº 97.634/1989 - Mercúrio metálico",
  "18 – 10":
    "Comércio de produtos químicos e produtos perigosos - Protocolo de Montreal",
  "18 – 13":
    "Comércio de produtos químicos e produtos perigosos - Resolução Conama nº 362/2005",
  "18 – 14": "Transporte de cargas perigosas - Resolução Conama nº 362/2005",
  "18 – 17":
    "Comércio de produtos químicos e produtos perigosos - Convenção de Estocolmo",
  "18 – 37": "Comércio de produtos químicos e produtos perigosos",
  "18 – 64":
    "Comércio de produtos químicos e produtos perigosos - Resolução Conama nº 463/2014",
  "18 – 66":
    "Comércio de produtos químicos e produtos perigosos - Lei nº 7.802/1989 - Agrotóxicos",
  "18 – 74": "Transporte de cargas perigosas (resíduos perigosos)",
  "18 – 79":
    "Comércio de produtos químicos e produtos perigosos (exportação de resíduos perigosos)",
  "18 – 80":
    "Depósito de produtos químicos e produtos perigosos - Lei nº 12.305/2010",
  "18 – 81":
    "Comércio de produtos químicos e produtos perigosos - Resolução Conama nº 401/2008",
  "18 – 83":
    "Transporte de cargas perigosas (material radiativo/rejeito radiativo)",
  "18 – 84":
    "Depósito de produtos químicos e produtos perigosos - Lei Complementar nº 140/2011",
  "19 – 1": "Complexos turísticos e de lazer, inclusive parques temáticos",
  "20 – 2": "Exploração econômica da madeira ou lenha e subprodutos florestais",
  "20 – 5": "Utilização do patrimônio genético natural",
  "20 – 6": "Exploração de recursos aquáticos vivos",
  "20 – 21": "Importação ou exportação de fauna nativa brasileira",
  "20 – 22": "Importação ou exportação de flora nativa brasileira",
  "20 – 23":
    "Atividade de criação e exploração econômica de fauna exótica e de fauna silvestre",
  "20 – 25":
    "Atividade de criação e exploração econômica de fauna exótica e de fauna silvestre",
  "20 – 26":
    "Introdução de espécies exóticas, exceto para melhoramento genético vegetal",
  "20 – 35":
    "Introdução de espécies geneticamente modificadas previamente identificadas pela CTNBio",
  "20 – 37":
    "Uso da diversidade biológica pela biotecnologia em atividades previamente identificadas pela CTNBio",
  "20 – 54":
    "Exploração de recursos aquáticos vivos - Lei nº 11.959/2009 - Aquicultura",
  "20 – 60": "Silvicultura - Lei nº 12.651/2012",
  "20 – 61": "Silvicultura - Lei nº 12.651/2012",
  "20 – 63":
    "Exploração econômica da madeira ou lenha e subprodutos florestais",
  "20 – 81":
    "Atividade de criação e exploração econômica de fauna exótica e de fauna silvestre",
  "21 – 3":
    "Utilização técnica de substâncias controladas - Protocolo de Montreal",
  "21 – 5": "Experimentação com agroquímicos - Lei nº 7.802/1989",
  "21 – 27": "Porte e uso de motosserra - Lei nº 12.651/2012",
  "21 – 30": "Operação de rodovia - Lei nº 6.938/1981",
  "21 – 31": "Operação de hidrovia - Lei nº 6.938/1981",
  "21 – 32": "Operação de aeródromo - Lei nº 6.938/1981",
  "21 – 33": "Estações de tratamento de água - Lei nº 6.938/1981",
  "21 – 34": "Transmissão de energia elétrica - Lei nº 6.938/1981",
  "21 – 35": "Geração de energia hidrelétrica - Lei nº 6.938/1981",
  "21 – 36":
    "Geração de energia eólica e de outras fontes alternativas - Lei nº 6.938/1981",
  "21 – 37": "Distribuição de energia elétrica - Lei nº 6.938/1981",
  "21 – 40": "Comércio exterior de resíduos controlados - Decreto nº 875/1993",
  "21 – 41":
    "Importação de lâmpadas fluorescentes, de vapor de sódio e mercúrio e de luz mista",
  "21 – 42": "Importação de eletrodomésticos - Resolução Conama nº 20/1994",
  "21 – 43":
    "Importação de veículos automotores para uso próprio - Lei nº 8.723/1993",
  "21 – 44":
    "Importação de veículos automotores para fins de comercialização - Lei nº 8.723/1993",
  "21 – 45": "Importação de pneus e similares - Resolução Conama nº 416/2009",
  "21 – 46": "Controle de plantas aquáticas - Resolução Conama nº 467/2015",
  "21 – 47": "Aplicação de agrotóxicos e afins - Lei nº 7.802/1989",
  "21 – 48":
    "Consumo industrial de madeira, de lenha e de carvão vegetal - Lei nº 12.651/2012",
  "21 – 49": "Transporte de produtos florestais - Lei nº 12.651/2012",
  "21 – 50": "Armazenamento de produtos florestais - Lei nº 12.651/2012",
  "21 – 51":
    "Formulação de produtos biorremediadores - Resolução Conama nº 463/2014",
  "21 – 52": "Centro de triagem e reabilitação - Resolução Conama nº 489/2018",
  "21 – 53":
    "Manutenção de fauna silvestre ou exótica - Resolução Conama nº 489/2018",
  "21 – 55":
    "Criação científica de fauna exótica e de fauna silvestre - Resolução Conama nº 489/2018",
  "21 – 56":
    "Criação conservacionista de fauna silvestre - Resolução Conama nº 489/2018",
  "21 – 57":
    "Importação ou exportação de fauna exótica - Portaria Ibama nº 93/1998",
  "21 – 58": "Manejo de fauna exótica invasora - Resolução Conabio nº 7/2018",
  "21 – 59":
    "Manejo de fauna sinantrópica nociva - Instrução Normativa Ibama nº 141/2006",
  "21 – 60":
    "Criação amadorista de passeriformes da fauna silvestre - Instrução Normativa Ibama nº 10/2011",
  "21 – 62":
    "Manutenção de área passível de Ato Declaratório Ambiental - Lei nº 6.938/1981",
  "21 – 64":
    "Exportação de carvão vegetal de espécies exóticas - Instrução Normativa Ibama nº 15/2011",
  "21 – 66":
    "Produção de agroquímicos de agentes biológicos e microbiológicos de controle",
  "21 – 67":
    "Comércio atacadista de madeira, de lenha e de outros produtos florestais - Lei nº 12.651/2012",
  "21 – 68":
    "Comércio varejista de madeira, de lenha e de outros produtos florestais - Lei nº 12.651/2012",
  "21 – 69": "Comercialização de recursos pesqueiros - Lei nº 11.959/2009",
  "21 – 70":
    "Revenda de organismos aquáticos vivos ornamentais - Lei nº 11.959/2009",
  "21 – 71":
    "Empreendimento comercial de animais vivos da fauna silvestre ou fauna",
  "21 – 72":
    "Empreendimento comercial de partes, produtos e subprodutos da fauna silvestre ou exótica",
  "21 – 73": "Comercialização de motosserra - Lei nº 12.651/2012",
  "21 – 74": "Criação de animais - Lei nº 6.938/1981",
  "21 – 75": "Irrigação - Resolução Conama nº 284/2001",
  "21 – 79":
    "Instalações nucleares e radiativas diversas - Lei Complementar nº 140/2011",
  "21 – 92": "Silvicultura de espécie nativa - Lei nº 12.651/2012",
  "21 – 93": "Silvicultura de espécie exótica - Lei nº 12.651/2012",
  "22 – 1": "Rodovias, ferrovias, hidrovias, metropolitanos",
  "22 – 2": "Construção de barragens e diques",
  "22 – 3": "Construção de canais para drenagem",
  "22 – 4": "Retificação do curso de água",
  "22 – 5": "Abertura de barras, embocaduras e canais",
  "22 – 6": "Transposição de bacias hidrográficas",
  "22 – 7": "Construção de obras de arte",
  "22 – 8": "Outras obras de infraestrutura",
};

// FTE Code to Category mapping
const FTE_CODE_CATEGORIES = {
  "Abastecimento de combustíveis": ["18-5", "18-6"],
  Agrotóxicos: ["15-11", "17-61", "18-66", "18-80", "21-5", "21-47", "21-66"],
  Biotecnologia: ["20-5", "20-35", "20-37", "21-51", "21-66"],
  "Criação amadorista de passeriformes": ["21-60"],
  "Convenção de Basileia": ["18-79", "21-40"],
  "Energia Elétrica": ["17-1", "21-34", "21-35", "21-36", "21-37", "21-46"],
  "Empreendimentos - Instalação": [
    "21-75",
    "22-1",
    "22-2",
    "22-3",
    "22-4",
    "22-5",
    "22-6",
    "22-7",
    "22-8",
  ],
  Fauna: [
    "10-1",
    "10-2",
    "16-15",
    "20-5",
    "20-21",
    "20-23",
    "20-25",
    "20-81",
    "21-52",
    "21-53",
    "21-55",
    "21-56",
    "21-60",
    "21-71",
    "21-72",
  ],
  "Fauna doméstica": ["10-1", "10-2", "16-2", "21-74"],
  "Fauna sinantrópica": ["21-59"],
  "Fauna invasora": ["20-26", "21-58"],
  "Fauna - Recursos pesqueiros": [
    "16-4",
    "20-5",
    "20-6",
    "20-54",
    "21-69",
    "21-70",
  ],
  "Flora e madeira": [
    "7-1",
    "7-2",
    "7-3",
    "7-4",
    "15-2",
    "15-4",
    "20-2",
    "20-5",
  ],
  "Importação / Exportação": [
    "18-8",
    "18-10",
    "18-13",
    "18-17",
    "18-66",
    "18-81",
    "20-21",
    "20-22",
    "20-26",
    "20-63",
    "20-81",
    "21-41",
    "21-42",
    "21-43",
    "21-44",
    "21-45",
    "21-46",
    "21-48",
    "21-49",
    "21-57",
    "21-64",
    "21-67",
    "21-68",
    "21-92",
    "21-93",
  ],
  "Logística Reversa": [
    "15-11",
    "17-61",
    "18-66",
    "18-80",
    "21-5",
    "21-47",
    "21-66",
  ],
  "Pilhas e baterias": ["5-1", "17-62", "18-74", "18-80"],
  Pneumáticos: ["9-6", "17-63", "21-45"],
  "Óleo lubrificante usado ou contaminado": [
    "15-2",
    "15-23",
    "18-13",
    "18-14",
    "18-80",
  ],
  "Lâmpadas fluorescentes, de vapor de sódio e mercúrio e de luz mista": [
    "5-4",
    "18-74",
    "21-41",
  ],
  Eletroeletrônicos: ["18-74", "18-80"],
  "Mercúrio metálico": ["1-7", "1-12", "15-20", "18-8"],
  Mineração: [
    "1-1",
    "1-2",
    "1-3",
    "1-4",
    "1-7",
    "17-58",
    "17-59",
    "18-2",
    "18-4",
    "22-2",
    "22-8",
  ],
  Pesticidas: ["15-11", "17-61", "18-66", "18-80", "21-5", "21-47", "21-66"],
};

// Function to get FTE category from code using the new structure
const getFteCategory = (codigo) => {
  if (!codigo || codigo === "N/A") return "Sem categoria";

  // Transform the code to match the format in the categories
  const transformedCode = codigo.replace(/ – /g, "-");

  // Find which category contains this code
  for (const [category, codes] of Object.entries(FTE_CODE_CATEGORIES)) {
    if (codes.includes(transformedCode)) {
      return category;
    }
  }

  return "Sem categoria";
};

function App() {
  // Function to get FTE title from code
  const getFteTitle = (codigo) => {
    return FTE_CODE_TITLES[codigo] || "Título não disponível";
  };

  const [fteData, setFteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fteCodeSearch, setFteCodeSearch] = useState("");
  const [expandedItems, setExpandedItems] = useState({});
  const [filterCnaeType, setFilterCnaeType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "list" or "grouped"
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchFteData();
  }, []);

  const fetchFteData = async () => {
    try {
      const response = await fetch("/all_fte_data.json");
      if (!response.ok) {
        throw new Error("Failed to fetch FTE data");
      }
      const data = await response.json();
      setFteData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Function to transform FTE code format from "18 – 4" to "18.4"
  const transformFteCode = (codigo) => {
    if (!codigo || codigo === "N/A") return "N/A";
    // Replace " – " with "." for better searchability
    return codigo.replace(/ – /g, ".");
  };

  // Function to group FTE data by código and organize by versions
  const groupFteByCodigo = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const codigo = item.data?.metadata?.["Código:"] || "N/A";
      const version = item.data?.metadata?.["Versão FTE:"] || "N/A";

      if (!grouped[codigo]) {
        grouped[codigo] = {
          codigo,
          codigoDisplay: transformFteCode(codigo), // Add transformed display format
          versions: [],
          latestVersion: null,
        };
      }

      // Parse version number for comparison
      const versionNum = parseFloat(version.replace(/[^\d.]/g, ""));

      grouped[codigo].versions.push({
        ...item,
        version,
        versionNum,
      });

      // Update latest version
      if (
        !grouped[codigo].latestVersion ||
        versionNum > grouped[codigo].latestVersion.versionNum
      ) {
        grouped[codigo].latestVersion = {
          ...item,
          version,
          versionNum,
        };
      }
    });

    // Sort versions within each group
    Object.values(grouped).forEach((group) => {
      group.versions.sort((a, b) => b.versionNum - a.versionNum);
    });

    return grouped;
  };

  const handleExpand = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded = {};
    filteredData.forEach((_, index) => {
      allExpanded[index] = true;
    });
    setExpandedItems(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedItems({});
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFteCodeSearch("");
    setFilterCnaeType("all");
    setFilterCategory("all");
    setCategoryFilter("");
  };

  const filteredData = fteData.filter((item) => {
    if (
      !searchTerm &&
      !fteCodeSearch &&
      filterCnaeType === "all" &&
      filterCategory === "all"
    )
      return true;

    const searchLower = searchTerm.toLowerCase();
    const url = item.url?.toLowerCase() || "";
    const metadata = item.data?.metadata || {};
    const sections = item.data?.sections || [];
    const cnae =
      item.data?.["Classificação Nacional de Atividades Econômicas"] || [];
    const code = metadata["Código:"] || "";

    // Search filter
    if (searchTerm) {
      const fteTitle = getFteTitle(metadata["Código:"] || "");
      const hasSearchMatch =
        url.includes(searchLower) ||
        fteTitle.toLowerCase().includes(searchLower) ||
        Object.values(metadata).some((value) =>
          value?.toLowerCase().includes(searchLower)
        ) ||
        sections.some(
          (section) =>
            section.title?.toLowerCase().includes(searchLower) ||
            section.content?.toLowerCase().includes(searchLower)
        ) ||
        cnae.some(
          (entry) =>
            entry.código?.toLowerCase().includes(searchLower) ||
            entry.descricao?.toLowerCase().includes(searchLower)
        );

      if (!hasSearchMatch) return false;
    }

    // FTE Code filter
    if (fteCodeSearch) {
      const fteCode = metadata["Código:"] || "";
      const fteCodeTransformed = transformFteCode(fteCode);
      const searchLower = fteCodeSearch.toLowerCase();

      // Check both original format and transformed format
      if (
        !fteCode.toLowerCase().includes(searchLower) &&
        !fteCodeTransformed.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter) {
      const fteCategory = getFteCategory(metadata["Código:"] || "");
      if (fteCategory !== categoryFilter) {
        return false;
      }
    }

    // CNAE type filter
    if (filterCnaeType !== "all") {
      const hasCnaeType = cnae.some(
        (entry) => entry.agrupamento === filterCnaeType
      );
      if (!hasCnaeType) return false;
    }

    // Category filter
    if (filterCategory !== "all") {
      // Use the new FTE_CODE_CATEGORIES structure
      const category = getFteCategory(code);
      if (category !== filterCategory) {
        return false;
      }
    }

    return true;
  });

  // Get grouped data for filtered results
  const groupedFilteredData = groupFteByCodigo(filteredData);

  const getStatistics = () => {
    // Get unique FTE codes
    const uniqueCodes = new Set();
    fteData.forEach((item) => {
      const codigo = item.data?.metadata?.["Código:"] || "N/A";
      if (codigo !== "N/A") {
        uniqueCodes.add(codigo);
      }
    });

    const totalUniqueCodes = uniqueCodes.size;
    const totalCnaeEntries = fteData.reduce((sum, item) => {
      const cnae =
        item.data?.["Classificação Nacional de Atividades Econômicas"] || [];
      return sum + cnae.length;
    }, 0);

    const cnaeTypeCounts = {};
    const categoryCounts = {};
    const environmentalThemeCounts = {};

    fteData.forEach((item) => {
      const cnae =
        item.data?.["Classificação Nacional de Atividades Econômicas"] || [];
      const code = item.data?.metadata?.["Código:"] || "";

      cnae.forEach((entry) => {
        const type = entry.agrupamento || "unknown";
        cnaeTypeCounts[type] = (cnaeTypeCounts[type] || 0) + 1;
      });

      // Count by traditional categories (simplified)
      const category = getFteCategory(code);
      if (category !== "Sem categoria") {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }

      // Count by environmental themes
      const theme = getFteCategory(code);
      if (theme !== "Sem categoria") {
        environmentalThemeCounts[theme] =
          (environmentalThemeCounts[theme] || 0) + 1;
      }
    });

    return {
      totalUniqueCodes,
      totalCnaeEntries,
      cnaeTypeCounts,
      categoryCounts,
      environmentalThemeCounts,
    };
  };

  const exportToCSV = () => {
    const stats = getStatistics();
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "FTE Statistics\n";
    csvContent += `Total Unique FTE Codes,${stats.totalUniqueCodes}\n`;
    csvContent += `Total CNAE Entries,${stats.totalCnaeEntries}\n\n`;

    csvContent += "CNAE Type Distribution\n";
    csvContent += "Type,Count\n";
    Object.entries(stats.cnaeTypeCounts).forEach(([type, count]) => {
      csvContent += `${type},${count}\n`;
    });

    csvContent += "\nCategory Distribution\n";
    csvContent += "Category,Count\n";
    Object.entries(stats.categoryCounts).forEach(([category, count]) => {
      csvContent += `${category},${count}\n`;
    });

    csvContent += "\nEnvironmental Theme Distribution\n";
    csvContent += "Theme,Count\n";
    Object.entries(stats.environmentalThemeCounts).forEach(([theme, count]) => {
      csvContent += `${theme},${count}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fte_statistics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFilteredResultsToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "FTE Filtered Results\n";
    csvContent += `Total Results,${filteredData.length}\n`;
    csvContent += `Search Term,${searchTerm || "N/A"}\n`;
    csvContent += `FTE Code Search,${fteCodeSearch || "N/A"}\n`;
    csvContent += `Category Filter,${
      filterCategory !== "all" ? filterCategory : "N/A"
    }\n`;
    csvContent += `Theme Filter,${categoryFilter || "N/A"}\n\n`;

    csvContent += "Código,Title,Category,Version,URL\n";
    filteredData.forEach((item) => {
      const codigo = item.data?.metadata?.["Código:"] || "N/A";
      const title = getFteTitle(codigo);
      const category = getFteCategory(codigo);
      const version = item.data?.metadata?.["Versão FTE:"] || "N/A";
      const url = item.url || "N/A";

      csvContent += `"${codigo}","${title}","${category}","${version}","${url}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fte_filtered_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render FTE content for both views
  const renderFteContent = (item, isGrouped = false) => (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 2 }} />

      {/* Metadata Section */}
      {item.data?.metadata && Object.keys(item.data.metadata).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <DescriptionIcon sx={{ mr: 1 }} />
              Metadados
            </Typography>
            <Button
              variant="text"
              size="small"
              startIcon={<OpenInNewIcon />}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: "0.75rem",
                color: "primary.main",
              }}
            >
              Ver Fonte
            </Button>
          </Box>
          <Grid container spacing={2}>
            {Object.entries(item.data.metadata).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {key}
                  </Typography>
                  <Typography variant="body2">{value || "N/A"}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Sections */}
      {item.data?.sections && item.data.sections.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <CategoryIcon sx={{ mr: 1 }} />
              Seções ({item.data.sections.length})
            </Typography>
            <Button
              variant="text"
              size="small"
              startIcon={<OpenInNewIcon />}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: "0.75rem",
                color: "primary.main",
              }}
            >
              Ver Fonte
            </Button>
          </Box>
          <Grid container spacing={2}>
            {item.data.sections.map((section, sectionIndex) => (
              <Grid item xs={12} sm={6} md={4} key={sectionIndex}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {section.content || "N/A"}
                  </Typography>
                  {section.items && section.items.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Itens:
                      </Typography>
                      {section.items.map((item, itemIndex) => (
                        <Chip
                          key={itemIndex}
                          label={item}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* CNAE Section */}
      {item.data?.["Classificação Nacional de Atividades Econômicas"] &&
        item.data["Classificação Nacional de Atividades Econômicas"].length >
          0 && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <CategoryIcon sx={{ mr: 1 }} />
                Classificação Nacional de Atividades Econômicas (
                {
                  item.data["Classificação Nacional de Atividades Econômicas"]
                    .length
                }
                )
              </Typography>
              <Button
                variant="text"
                size="small"
                startIcon={<OpenInNewIcon />}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: "0.75rem",
                  color: "primary.main",
                }}
              >
                Ver Fonte
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Agrupamento</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Código</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Descrição</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {item.data[
                    "Classificação Nacional de Atividades Econômicas"
                  ].map((cnae, cnaeIndex) => (
                    <TableRow key={cnaeIndex}>
                      <TableCell>
                        <Chip
                          label={cnae.agrupamento || "N/A"}
                          size="small"
                          color={
                            cnae.agrupamento === "descritor"
                              ? "primary"
                              : "secondary"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cnae.código || "N/A"}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                          {cnae.descricao || "N/A"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

      {/* Referências Normativas Section with Numbered Items */}
      {item.data?.unknown_section && item.data.unknown_section.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <CategoryIcon sx={{ mr: 1 }} />
              Referências Normativas ({item.data.unknown_section.length})
            </Typography>
            <Button
              variant="text"
              size="small"
              startIcon={<OpenInNewIcon />}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: "0.75rem",
                color: "primary.main",
              }}
            >
              Ver Fonte
            </Button>
          </Box>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {item.data.unknown_section.map((item_text, itemIndex) => (
                <Grid item xs={12} key={itemIndex}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={itemIndex + 1}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        minWidth: "32px",
                        justifyContent: "center",
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1, pt: 0.5 }}>
                      {item_text}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Raw Content Section */}
      {item.data?.raw_content && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <DescriptionIcon sx={{ mr: 1 }} />
              Conteúdo Bruto (Raw Content)
            </Typography>
            <Button
              variant="text"
              size="small"
              startIcon={<OpenInNewIcon />}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: "0.75rem",
                color: "primary.main",
              }}
            >
              Ver Fonte Original
            </Button>
          </Box>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: "#f8f9fa",
              maxHeight: "400px",
              overflow: "auto",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography
              component="pre"
              variant="body2"
              sx={{
                margin: 0,
                fontFamily: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit",
                whiteSpace: "inherit",
                wordBreak: "inherit",
              }}
            >
              {item.data.raw_content}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Carregando dados FTE...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar dados FTE: {error}
        </Alert>
      </Container>
    );
  }

  const stats = getStatistics();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          color="primary"
        >
          FTE Viewer
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          align="center"
          color="text.secondary"
        >
          Visualizador de Fichas Técnicas de Enquadramento
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mt: 3, mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                textAlign: "center",
                bgcolor: "primary.light",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h4" component="div">
                  {stats.totalUniqueCodes}
                </Typography>
                <Typography variant="body2">
                  Total de Códigos FTE Únicos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                textAlign: "center",
                bgcolor: "secondary.light",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h4" component="div">
                  {stats.totalCnaeEntries}
                </Typography>
                <Typography variant="body2">Entradas CNAE</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                textAlign: "center",
                bgcolor: "success.light",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h4" component="div">
                  {Object.keys(stats.cnaeTypeCounts).length}
                </Typography>
                <Typography variant="body2">Tipos CNAE</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                textAlign: "center",
                bgcolor: "info.light",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h4" component="div">
                  {Object.keys(FTE_CODE_CATEGORIES).length}
                </Typography>
                <Typography variant="body2">Temas Ambientais</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Pesquisar por código, título, descrição, CNAE, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por código FTE (ex: 1.1, 15.1, 18.4)"
                value={fteCodeSearch}
                onChange={(e) => setFteCodeSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CodeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo CNAE</InputLabel>
                <Select
                  value={filterCnaeType}
                  label="Tipo CNAE"
                  onChange={(e) => setFilterCnaeType(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="descritor">Descritor</MenuItem>
                  <MenuItem value="subclasse">Subclasse</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={filterCategory}
                  label="Categoria"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {Object.keys(FTE_CODE_CATEGORIES).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                >
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListIcon sx={{ mr: 1 }} />
                    Lista
                  </ToggleButton>
                  <ToggleButton value="grouped" aria-label="grouped view">
                    <GroupIcon sx={{ mr: 1 }} />
                    Agrupado
                  </ToggleButton>
                </ToggleButtonGroup>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                >
                  Limpar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setStatsDialogOpen(true)}
                  startIcon={<AnalyticsIcon />}
                >
                  Estatísticas
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Quick Filter Chips */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Filtros rápidos:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {[
              "Mineração",
              "Agrotóxicos",
              "Energia Elétrica",
              "Fauna",
              "Flora e madeira",
            ].map((theme) => (
              <Chip
                key={theme}
                label={theme}
                size="small"
                variant={categoryFilter === theme ? "filled" : "outlined"}
                color={categoryFilter === theme ? "primary" : "default"}
                onClick={() =>
                  setFilterCategory(categoryFilter === theme ? "all" : theme)
                }
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </Box>

        {/* Results Summary */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {viewMode === "list"
                ? `Total de FTEs encontradas: ${filteredData.length}`
                : `Total de códigos FTE únicos: ${
                    Object.keys(groupedFilteredData).length
                  }`}
              {searchTerm && ` | Pesquisa: "${searchTerm}"`}
              {fteCodeSearch && ` | Código FTE: "${fteCodeSearch}"`}
              {filterCnaeType !== "all" && ` | Tipo CNAE: ${filterCnaeType}`}
              {filterCategory !== "all" && ` | Categoria: ${filterCategory}`}
              {categoryFilter && ` | Tema: ${categoryFilter}`}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={handleExpandAll}>
                Expandir Todos
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCollapseAll}
              >
                Recolher Todos
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={exportToCSV}
                startIcon={<DownloadIcon />}
              >
                Estatísticas CSV
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={exportFilteredResultsToCSV}
                startIcon={<DownloadIcon />}
                disabled={filteredData.length === 0}
              >
                Resultados CSV
              </Button>
            </Stack>
          </Box>

          {searchTerm ||
          fteCodeSearch ||
          filterCnaeType !== "all" ||
          filterCategory !== "all" ||
          categoryFilter ? (
            <LinearProgress
              variant="determinate"
              value={(filteredData.length / fteData.length) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          ) : null}
        </Box>
      </Box>

      {/* FTE Cards - List View */}
      {viewMode === "list" && (
        <Grid container spacing={3}>
          {filteredData.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {transformFteCode(
                          item.data?.metadata?.["Código:"] || "N/A"
                        )}
                        {getFteTitle(item.data?.metadata?.["Código:"] || "N/A")}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        <Chip
                          label={getFteCategory(
                            item.data?.metadata?.["Código:"] || "N/A"
                          )}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Versão: {item.data?.metadata?.["Versão FTE:"] || "N/A"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ wordBreak: "break-all", fontSize: "0.8rem" }}
                      >
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: "primary.main",
                            textDecoration: "none",
                            "&:hover": {
                              textDecoration: "underline",
                              color: "primary.dark",
                            },
                          }}
                        >
                          {item.url}
                        </Link>
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          mt: 1,
                          fontSize: "0.75rem",
                          py: 0.5,
                          px: 1.5,
                        }}
                      >
                        Abrir Página Original
                      </Button>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {item.data?.[
                        "Classificação Nacional de Atividades Econômicas"
                      ]?.length > 0 && (
                        <Tooltip title="Entradas CNAE">
                          <Badge
                            badgeContent={
                              item.data[
                                "Classificação Nacional de Atividades Econômicas"
                              ].length
                            }
                            color="primary"
                          >
                            <BusinessIcon color="action" />
                          </Badge>
                        </Tooltip>
                      )}
                      <IconButton
                        onClick={() => handleExpand(index)}
                        sx={{
                          transform: expandedItems[index]
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {expandedItems[index] && renderFteContent(item)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* FTE Cards - Grouped View */}
      {viewMode === "grouped" && (
        <Grid container spacing={3}>
          {Object.entries(groupedFilteredData).map(([codigo, group]) => (
            <Grid item xs={12} key={codigo}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {group.codigoDisplay} {getFteTitle(codigo)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        <Chip
                          label={getFteCategory(codigo)}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        Versão: {group.latestVersion.version} (mais recente)
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Total de versões: {group.versions.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {group.latestVersion.data?.[
                        "Classificação Nacional de Atividades Econômicas"
                      ]?.length > 0 && (
                        <Tooltip title="Entradas CNAE">
                          <Badge
                            badgeContent={
                              group.latestVersion.data[
                                "Classificação Nacional de Atividades Econômicas"
                              ].length
                            }
                            color="primary"
                          >
                            <BusinessIcon color="action" />
                          </Badge>
                        </Tooltip>
                      )}
                      <IconButton
                        onClick={() => handleExpand(codigo)}
                        sx={{
                          transform: expandedItems[codigo]
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {expandedItems[codigo] && (
                    <Box>
                      {/* Latest Version Content */}
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="h6"
                          color="success.main"
                          gutterBottom
                        >
                          Versão Atual: {group.latestVersion.version}
                        </Typography>
                        {renderFteContent(group.latestVersion, true)}
                      </Box>

                      {/* Previous Versions */}
                      {group.versions.length > 1 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                          >
                            Versões Anteriores
                          </Typography>
                          {group.versions.slice(1).map((version, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 3,
                                pl: 3,
                                borderLeft: "2px solid #e0e0e0",
                              }}
                            >
                              <Typography
                                variant="h6"
                                color="text.secondary"
                                gutterBottom
                              >
                                Versão: {version.version}
                              </Typography>
                              {renderFteContent(version, true)}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Statistics Dialog */}
      <Dialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AnalyticsIcon sx={{ mr: 1 }} />
            Estatísticas Detalhadas
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Distribuição por Tipo CNAE
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Tipo</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Quantidade</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(stats.cnaeTypeCounts).map(
                      ([type, count]) => (
                        <TableRow key={type}>
                          <TableCell>
                            <Chip
                              label={type}
                              size="small"
                              color={
                                type === "descritor" ? "primary" : "secondary"
                              }
                            />
                          </TableCell>
                          <TableCell>{count}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Distribuição por Categoria
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Categoria</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Quantidade</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(stats.categoryCounts).map(
                      ([category, count]) => (
                        <TableRow key={category}>
                          <TableCell>
                            <Chip
                              label={category}
                              size="small"
                              color="default"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{count}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={exportToCSV} startIcon={<DownloadIcon />}>
            Exportar CSV
          </Button>
          <Button onClick={() => setStatsDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
