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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Tabs,
  Tab,
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
  CardActions,
  Stack,
  LinearProgress,
  Link,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  Category as CategoryIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import "./App.css";

function App() {
  const [fteData, setFteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [filterCnaeType, setFilterCnaeType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showStats, setShowStats] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);

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
    setFilterCnaeType("all");
    setFilterCategory("all");
  };

  const filteredData = fteData.filter((item) => {
    if (!searchTerm && filterCnaeType === "all" && filterCategory === "all")
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
      const hasSearchMatch =
        url.includes(searchLower) ||
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

    // CNAE type filter
    if (filterCnaeType !== "all") {
      const hasCnaeType = cnae.some(
        (entry) => entry.agrupamento === filterCnaeType
      );
      if (!hasCnaeType) return false;
    }

    // Category filter
    if (filterCategory !== "all") {
      if (filterCategory === "mining" && code.includes("1")) return true;
      if (filterCategory === "chemical" && code.includes("15")) return true;
      if (filterCategory === "food" && code.includes("16")) return true;
      if (filterCategory === "utility" && code.includes("17")) return true;
      if (filterCategory === "transport" && code.includes("18")) return true;
      if (filterCategory === "tourism" && code.includes("19")) return true;
      if (filterCategory === "natural-resources" && code.includes("20"))
        return true;
      if (filterCategory === "control" && code.includes("21")) return true;
      return false;
    }

    return true;
  });

  const getStatistics = () => {
    const totalFtes = fteData.length;
    const totalCnaeEntries = fteData.reduce((sum, item) => {
      const cnae =
        item.data?.["Classificação Nacional de Atividades Econômicas"] || [];
      return sum + cnae.length;
    }, 0);

    const cnaeTypeCounts = {};
    const categoryCounts = {};

    fteData.forEach((item) => {
      const cnae =
        item.data?.["Classificação Nacional de Atividades Econômicas"] || [];
      const code = item.data?.metadata?.["Código:"] || "";

      cnae.forEach((entry) => {
        const type = entry.agrupamento || "unknown";
        cnaeTypeCounts[type] = (cnaeTypeCounts[type] || 0) + 1;
      });

      if (code.includes("1"))
        categoryCounts["Mining"] = (categoryCounts["Mining"] || 0) + 1;
      if (code.includes("15"))
        categoryCounts["Chemical"] = (categoryCounts["Chemical"] || 0) + 1;
      if (code.includes("16"))
        categoryCounts["Food & Beverage"] =
          (categoryCounts["Food & Beverage"] || 0) + 1;
      if (code.includes("17"))
        categoryCounts["Utility Services"] =
          (categoryCounts["Utility Services"] || 0) + 1;
      if (code.includes("18"))
        categoryCounts["Transport & Trade"] =
          (categoryCounts["Transport & Trade"] || 0) + 1;
      if (code.includes("19"))
        categoryCounts["Tourism"] = (categoryCounts["Tourism"] || 0) + 1;
      if (code.includes("20"))
        categoryCounts["Natural Resources"] =
          (categoryCounts["Natural Resources"] || 0) + 1;
      if (code.includes("21"))
        categoryCounts["Environmental Control"] =
          (categoryCounts["Environmental Control"] || 0) + 1;
    });

    return {
      totalFtes,
      totalCnaeEntries,
      cnaeTypeCounts,
      categoryCounts,
    };
  };

  const exportToCSV = () => {
    const stats = getStatistics();
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "FTE Statistics\n";
    csvContent += `Total FTEs,${stats.totalFtes}\n`;
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

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fte_statistics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                  {stats.totalFtes}
                </Typography>
                <Typography variant="body2">Total de FTEs</Typography>
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
                  {Object.keys(stats.categoryCounts).length}
                </Typography>
                <Typography variant="body2">Categorias</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Pesquisar por código, descrição, CNAE, etc..."
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
                  <MenuItem value="mining">Mineração</MenuItem>
                  <MenuItem value="chemical">Química</MenuItem>
                  <MenuItem value="food">Alimentos</MenuItem>
                  <MenuItem value="utility">Serviços</MenuItem>
                  <MenuItem value="transport">Transporte</MenuItem>
                  <MenuItem value="tourism">Turismo</MenuItem>
                  <MenuItem value="natural-resources">
                    Recursos Naturais
                  </MenuItem>
                  <MenuItem value="control">Controle Ambiental</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
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
              Total de FTEs encontradas: {filteredData.length}
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
                Exportar CSV
              </Button>
            </Stack>
          </Box>

          {searchTerm ||
          filterCnaeType !== "all" ||
          filterCategory !== "all" ? (
            <LinearProgress
              variant="determinate"
              value={(filteredData.length / fteData.length) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          ) : null}
        </Box>
      </Box>

      {/* FTE Cards */}
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
                      <CodeIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      FTE {item.data?.metadata?.["Código:"] || "N/A"}
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

                {expandedItems[index] && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />

                    {/* Metadata Section */}
                    {item.data?.metadata &&
                      Object.keys(item.data.metadata).length > 0 && (
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
                            {Object.entries(item.data.metadata).map(
                              ([key, value]) => (
                                <Grid item xs={12} sm={6} md={4} key={key}>
                                  <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography
                                      variant="subtitle2"
                                      color="primary"
                                      gutterBottom
                                    >
                                      {key}
                                    </Typography>
                                    <Typography variant="body2">
                                      {value || "N/A"}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )
                            )}
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
                                <Typography
                                  variant="subtitle2"
                                  color="primary"
                                  gutterBottom
                                >
                                  {section.title}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {section.content || "N/A"}
                                </Typography>
                                {section.items && section.items.length > 0 && (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
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
                    {item.data?.[
                      "Classificação Nacional de Atividades Econômicas"
                    ] &&
                      item.data[
                        "Classificação Nacional de Atividades Econômicas"
                      ].length > 0 && (
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
                                item.data[
                                  "Classificação Nacional de Atividades Econômicas"
                                ].length
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
                                      <Typography
                                        variant="body2"
                                        sx={{ fontSize: "0.9rem" }}
                                      >
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
                    {item.data?.unknown_section &&
                      item.data.unknown_section.length > 0 && (
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
                              Referências Normativas (
                              {item.data.unknown_section.length})
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
                              {item.data.unknown_section.map(
                                (item_text, itemIndex) => (
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
                                      <Typography
                                        variant="body2"
                                        sx={{ flex: 1, pt: 0.5 }}
                                      >
                                        {item_text}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )
                              )}
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
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
