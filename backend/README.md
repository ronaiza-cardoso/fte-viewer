# FTE Viewer Backend

A comprehensive Python backend for web scraping and data processing of FTE (Fichas Técnicas de Enquadramento) data from Brazilian environmental agencies.

## 🚀 Features

- **Web Scraping**: Automated extraction of FTE data from government websites
- **Data Processing**: Conversion of HTML content to structured JSON format
- **CNAE Classification**: Extraction and parsing of CNAE (Classificação Nacional de Atividades Econômicas) data
- **Error Handling**: Robust error handling with detailed logging and debugging
- **Rate Limiting**: Built-in rate limiting to avoid overwhelming servers
- **Modular Design**: Clean, object-oriented architecture for easy maintenance

## 📋 Requirements

- Python 3.8+
- See `requirements.txt` for detailed dependencies

## 🛠️ Installation

### Option 1: Install from source
```bash
# Clone the repository
git clone <repository-url>
cd fte-viewer/backend

# Install dependencies
pip install -r requirements.txt

# Install the package
pip install -e .
```

### Option 2: Install dependencies only
```bash
pip install -r requirements.txt
```

## 🔧 Usage

### Basic Usage

```python
from fte_viewer_backend import FTEScraper

# Initialize scraper
scraper = FTEScraper()

# Scrape FTE data from URLs
urls = [
    "https://sei.ibama.gov.br/documento_consulta_externa.php?id_acesso_externo=1261093&id_documento=18550666&infra_hash=74d48482f43654c143367dc78e20a0fa"
]

results = scraper.scrape_ftes(urls, "output.json")
print(f"Scraped {results['total_ftes']} FTEs")
```

### Individual Functions

```python
from fte_viewer_backend import (
    extract_fte_content,
    markdown_to_json,
    parse_fte_to_json,
    get_page_content,
    find_fte_links
)

# Extract content from a single page
soup = get_page_content("https://example.com")
content = extract_fte_content(soup)

# Convert to JSON
json_data = markdown_to_json(soup)
```

### Command Line Usage

```bash
# Run the scraper directly
python -m fte_viewer_backend.scrapper

# Or use the installed command
fte-scraper
```

## 📊 Data Structure

The scraper produces JSON data with the following structure:

```json
{
  "url": "https://example.com/fte-page",
  "data": {
    "metadata": {
      "Código:": "FTE-001",
      "Versão FTE:": "1.0",
      "Data:": "2024-01-01"
    },
    "sections": [
      {
        "title": "Section Title",
        "content": "Section content",
        "items": ["item1", "item2"]
      }
    ],
    "Classificação Nacional de Atividades Econômicas": [
      {
        "agrupamento": "descritor",
        "código": "1234-5/01",
        "descricao": "Activity description"
      }
    ],
    "raw_content": "Raw HTML content as text"
  }
}
```

## 🏗️ Architecture

### Core Classes

- **`FTEScraper`**: Main scraper class with comprehensive functionality
- **`BeautifulSoup`**: HTML parsing and content extraction
- **`requests.Session`**: HTTP requests with retry logic and rate limiting

### Key Methods

- `get_page_content()`: Retrieve and parse web pages
- `find_fte_links()`: Locate FTE links on government pages
- `extract_fte_content()`: Extract main content from FTE pages
- `markdown_to_json()`: Convert HTML to structured JSON
- `scrape_ftes()`: Main scraping orchestration method

## ⚙️ Configuration

### Environment Variables

```bash
# Optional: Set custom base URL
export FTE_BASE_URL="https://sei.ibama.gov.br"

# Optional: Set custom timeouts
export FTE_TIMEOUT="30"
```

### Customization

```python
# Custom base URL and timeouts
scraper = FTEScraper(
    base_url="https://custom.gov.br"
)

# Custom page retrieval
soup = scraper.get_page_content(
    url="https://example.com",
    timeout=60
)
```

## 📝 Logging

The backend includes comprehensive logging:

```python
import logging

# Set log level
logging.basicConfig(level=logging.INFO)

# View logs
logger = logging.getLogger(__name__)
logger.info("Processing FTE data")
```

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=fte_viewer_backend

# Run specific tests
pytest tests/test_scrapper.py
```

## 🚨 Error Handling

The scraper handles various error scenarios:

- **Network Timeouts**: Automatic retry with exponential backoff
- **Connection Errors**: Graceful degradation with detailed logging
- **Parse Errors**: Fallback to raw content extraction
- **Rate Limiting**: Built-in delays between requests

## 📈 Performance

- **Concurrent Processing**: Support for multiple URL processing
- **Memory Efficient**: Streaming JSON output for large datasets
- **Rate Limiting**: Configurable delays to respect server limits
- **Caching**: Session reuse for improved performance

## 🔒 Security

- **User-Agent Headers**: Professional browser identification
- **Rate Limiting**: Prevents server overload
- **Error Handling**: No sensitive data exposure in logs
- **Session Management**: Secure HTTP session handling

## 📚 API Reference

### FTEScraper Class

```python
class FTEScraper:
    def __init__(self, base_url: str = "https://sei.ibama.gov.br")
    
    def get_page_content(self, url: str, timeout: int = 30) -> Optional[BeautifulSoup]
    def find_fte_links(self, soup: BeautifulSoup) -> List[str]
    def extract_fte_content(self, soup: BeautifulSoup) -> str
    def markdown_to_json(self, soup: BeautifulSoup) -> Dict[str, Any]
    def scrape_ftes(self, urls: List[str], output_file: str) -> Dict[str, Any]
```

### Standalone Functions

```python
def extract_fte_content(soup: BeautifulSoup) -> str
def markdown_to_json(soup: BeautifulSoup) -> Dict[str, Any]
def parse_fte_to_json(soup: BeautifulSoup) -> Dict[str, Any]
def get_page_content(url: str) -> Optional[BeautifulSoup]
def find_fte_links(soup: BeautifulSoup) -> List[str]
def extract_description_from_raw_text(raw_text: str, code: str, cnae_type: str) -> str
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Include error logs and reproduction steps

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Core scraping functionality
- CNAE data extraction
- JSON output format
- Error handling and logging

---

**Happy Scraping! 🕷️**
