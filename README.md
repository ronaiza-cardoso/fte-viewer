# FTE Viewer - Visualizador de Fichas Técnicas de Enquadramento

Um visualizador avançado e interativo para Fichas Técnicas de Enquadramento (FTE) do IBAMA, desenvolvido com React e Material-UI.

## 🚀 Funcionalidades

### 📊 Dashboard Estatístico

- **Contadores em tempo real**: Total de FTEs, entradas CNAE, tipos CNAE e categorias
- **Visualização gráfica**: Cards coloridos com estatísticas principais
- **Análise detalhada**: Modal com distribuições por tipo CNAE e categoria

### 🔍 Sistema de Busca Avançado

- **Busca textual**: Pesquisa em códigos, descrições, CNAE e metadados
- **Filtros por tipo CNAE**: Descritor ou Subclasse
- **Filtros por categoria**: Mineração, Química, Alimentos, Serviços, etc.
- **Busca inteligente**: Combina múltiplos critérios de filtro

### 📋 Visualização de Dados

- **Cards expansíveis**: Interface limpa com expansão sob demanda
- **Metadados organizados**: Exibição estruturada de informações FTE
- **Tabelas CNAE**: Visualização clara de códigos e descrições
- **Seções categorizadas**: Organização lógica do conteúdo

### 🎨 Interface Moderna

- **Design responsivo**: Funciona em desktop, tablet e mobile
- **Tema Material-UI**: Interface consistente e profissional
- **Animações suaves**: Transições e efeitos visuais
- **Gradientes e sombras**: Visual moderno e atrativo

### 📤 Exportação e Ações

- **Exportar CSV**: Estatísticas em formato tabular
- **Expandir/Recolher**: Controles para todos os itens
- **Limpar filtros**: Reset rápido das configurações
- **Progress bar**: Indicador visual de resultados filtrados

## 🛠️ Tecnologias Utilizadas

- **React 19**: Framework principal
- **Material-UI 7**: Componentes de interface
- **CSS3**: Estilos customizados e responsivos
- **JavaScript ES6+**: Lógica da aplicação

## 📁 Estrutura do Projeto

```
fte-viewer/
├── public/
│   ├── all_fte_data.json    # Dados FTE (atualizado automaticamente)
│   ├── index.html           # Página principal
│   └── ...
├── src/
│   ├── App.js               # Componente principal
│   ├── App.css              # Estilos customizados
│   └── ...
└── package.json             # Dependências e scripts
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
cd fte-viewer
npm install
```

### Desenvolvimento

```bash
npm start
```

A aplicação abrirá em `http://localhost:3000`

### Build de Produção

```bash
npm run build
```

## 📊 Estrutura dos Dados

### Formato FTE

```json
{
  "url": "URL da FTE",
  "data": {
    "metadata": {
      "Código:": "1 – 1",
      "Versão FTE:": "1.4"
    },
    "Classificação Nacional de Atividades Econômicas": [
      {
        "agrupamento": "descritor",
        "código": "0990-4/01",
        "descricao": "Descrição da atividade"
      }
    ]
  }
}
```

### Categorias Suportadas

- **Mineração** (código 1): Extração e tratamento de minerais
- **Química** (código 15): Substâncias e produtos químicos
- **Alimentos** (código 16): Produtos alimentares e bebidas
- **Serviços** (código 17): Serviços de utilidade pública
- **Transporte** (código 18): Transporte, terminais e comércio
- **Turismo** (código 19): Complexos turísticos e lazer
- **Recursos Naturais** (código 20): Uso de recursos naturais
- **Controle Ambiental** (código 21): Atividades de fiscalização

## 🎯 Recursos de Filtro

### Por Tipo CNAE

- **Descritor**: Atividades específicas e detalhadas
- **Subclasse**: Agrupamentos de atividades relacionadas

### Por Categoria

- Filtros inteligentes baseados nos códigos FTE
- Agrupamento automático por setor de atividade
- Contadores em tempo real para cada categoria

## 📱 Responsividade

- **Desktop**: Layout em grid com múltiplas colunas
- **Tablet**: Adaptação para telas médias
- **Mobile**: Layout em coluna única otimizado
- **Touch-friendly**: Interface adaptada para dispositivos touch

## 🔧 Personalização

### Cores e Temas

- Gradientes personalizados para cards estatísticos
- Esquema de cores consistente com Material-UI
- Suporte a temas claro/escuro (futuro)

### Componentes

- Cards customizáveis para diferentes tipos de dados
- Tabelas responsivas com estilos aprimorados
- Chips e badges para melhor identificação visual

## 📈 Melhorias Futuras

- [ ] Modo escuro/claro
- [ ] Gráficos interativos (Chart.js/D3.js)
- [ ] Filtros avançados por data
- [ ] Sistema de favoritos
- [ ] Comparação entre FTEs
- [ ] Histórico de buscas
- [ ] Notificações de atualizações
- [ ] Modo offline

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para o IBAMA e a comunidade ambiental brasileira**
