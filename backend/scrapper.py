import requests
import json
from bs4 import BeautifulSoup
from IPython.display import display, Markdown
import datetime
import time

def extract_fte_content(soup):
    # Try to find the main content table
    table = soup.find('table', {'border': '1'})
    if table:
        # Extract all text from the table
        return table.get_text(separator='\n', strip=True)
    return "Could not extract main content from FTE page"

def markdown_to_json(soup):
    """Convert HTML table content to structured JSON using table rows"""
    json_data = {
        "metadata": {},
        "sections": [],
        "raw_content": soup.get_text(separator='\n', strip=True)
    }
    
    # Find the main table
    table = soup.find('table', {'border': '1'})
    if not table:
        return json_data
    
    rows = table.find_all('tr')
    in_cnae_section = False
    cnae_entries = []
    
    for i, row in enumerate(rows):
        cells = row.find_all(['td', 'th'])
        if len(cells) >= 2:
            key = cells[0].get_text(strip=True)
            value = cells[1].get_text(strip=True)
            
            # Check if we're entering the CNAE section
            if "Classificação Nacional de Atividades Econômicas" in key:
                in_cnae_section = True
                json_data["Classificação Nacional de Atividades Econômicas"] = []
                continue
            
            # Alternative: Check if we're entering the CNAE section by looking for "Agrupamento:" followed by "Código:" and "Descrição:"
            if key == "Agrupamento:" and value == "Código:":
                in_cnae_section = True
                json_data["Classificação Nacional de Atividades Econômicas"] = []
                continue
            
            # Common metadata fields
            if any(keyword in key.lower() for keyword in ['código', 'descrição', 'versão', 'data', 'categoria']):
                json_data["metadata"][key] = value
            else:
                # Create a new section
                current_section = {
                    "title": key,
                    "content": value,
                    "items": []
                }
                json_data["sections"].append(current_section)
    
    # Now parse the CNAE section by looking for rows with "subclasse" or "descritor" content
    if in_cnae_section:
        # Extract descriptions from raw content using regex-like approach
        raw_text = soup.get_text(separator='\n', strip=True)
        
        for i, row in enumerate(rows):
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                first_cell = cells[0].get_text(strip=True)
                second_cell = cells[1].get_text(strip=True)
                
                # Look for rows that contain "subclasse" or "descritor" in either cell
                if ("subclasse" in first_cell.lower() or "subclasse" in second_cell.lower() or
                    "descritor" in first_cell.lower() or "descritor" in second_cell.lower()):
                    
                    # Determine the type (subclasse or descritor)
                    cnae_type = None
                    if "subclasse" in first_cell.lower() or "subclasse" in second_cell.lower():
                        cnae_type = "subclasse"
                    elif "descritor" in first_cell.lower() or "descritor" in second_cell.lower():
                        cnae_type = "descritor"
                    
                    # Extract the code and description
                    if cnae_type in first_cell.lower():
                        # First cell contains the type, second cell has code
                        code = second_cell.strip()
                        description = extract_description_from_raw_text(raw_text, code, cnae_type)
                        
                        cnae_entries.append({
                            "agrupamento": cnae_type,
                            "código": code,
                            "descricao": description
                        })
                    elif cnae_type in second_cell.lower():
                        # Second cell contains the type, first cell might have code
                        code = first_cell.strip()
                        description = extract_description_from_raw_text(raw_text, code, cnae_type)
                        
                        cnae_entries.append({
                            "agrupamento": cnae_type,
                            "código": code,
                            "descricao": description
                        })
    
    # Add all CNAE entries
    if cnae_entries:
        json_data["Classificação Nacional de Atividades Econômicas"] = cnae_entries
    
    return json_data

def extract_description_from_raw_text(raw_text, code, cnae_type):
    """Extract description for a given CNAE code from raw text"""
    # The format is:
    # Line 1: Descritor/Subclasse
    # Line 2: Code
    # Line 3: Description
    
    # Split the raw text into lines
    lines = raw_text.split('\n')
    
    for i, line in enumerate(lines):
        line = line.strip()
        # Look for the type (Descritor/Subclasse)
        if cnae_type.lower() in line.lower():
            # Check if the next line contains the code
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if code in next_line:
                    # The description is on the line after the code
                    if i + 2 < len(lines):
                        description_line = lines[i + 2].strip()
                        if description_line and not (description_line.startswith("Subclasse") or description_line.startswith("Descritor")):
                            return description_line
                    return ""
    
    return ""

def parse_fte_to_json(soup):
    # Initialize the JSON structure
    fte_json = {
        "metadata": {},
        "sections": []
    }

    # soup is already a BeautifulSoup object
    print(f"\n{'='*80}\nProcessing soup content\n{'='*80}")

    # Extract the main table
    table = soup.find('table', {'border': '1'})
    if not table:
        return {"error": "No main table found in FTE content"}

    # Extract all rows
    rows = table.find_all('tr')

    # Process each row
    current_section = None
    for row in rows:
        cells = row.find_all(['td', 'th'])
        if len(cells) >= 2:
            key = cells[0].get_text(strip=True)
            value = cells[1].get_text(strip=True)

            # Handle special sections
            if key == "Código:":
                fte_json["metadata"]["codigo"] = value
            elif key == "Descrição:":
                fte_json["metadata"]["descricao"] = value
            elif key == "Versão FTE:":
                fte_json["metadata"]["versao"] = value
            elif key == "Data:":
                fte_json["metadata"]["data"] = value
            elif key in ["A descrição compreende:", "A descrição não compreende:"]:
                current_section = key.replace(":", "").lower().replace(" ", "_")
                fte_json["sections"].append({
                    "title": key,
                    "items": []
                })
            elif current_section:
                # Add items to current section
                for section in fte_json["sections"]:
                    if section["title"] == key.replace(":", ""):
                        section["items"].append(value)

    return fte_json

def get_page_content(url):
    try:
        # Add timeout and retry logic
        session = requests.Session()
        session.mount('https://', requests.adapters.HTTPAdapter(max_retries=3))
        
        response = session.get(url, timeout=30)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except requests.exceptions.Timeout:
        print(f"Timeout accessing {url}")
        return None
    except requests.exceptions.ConnectionError:
        print(f"Connection error accessing {url}")
        return None
    except Exception as e:
        print(f"Error accessing {url}: {str(e)}")
        return None

def find_fte_links(soup):
    fte_links = []
    # Find all links with class 'plgBotao' that contain "FTE" in their text
    for link in soup.find_all('a', class_='plgBotao'):
        if 'fte' in link.get_text().lower():
            if link.get('href'):
                fte_links.append(link['href'])
    return fte_links

# List of URLs to process
baseUrl = "https://www.gov.br/ibama/pt-br/servicos/cadastros/ctf/ctf-app/ftes/lista-de-todas-as-ftes/"

urls = [
  "ftes-categoria-1-extracao-e-tratamento-de-minerais",
  "ftes-categoria-1-extracao-e-tratamento-de-minerais-1-2-lavra-a-ceu-aberto-inclusive-de-aluviao-com-ou-sem-beneficiamento",
  "ftes-categoria-1-extracao-e-tratamento-de-minerais-1-3-lavra-subterranea-com-ou-sem-beneficiamento",
  "ftes-categoria-1-extracao-e-tratamento-de-minerais-1-4-lavra-garimpeira",
  "ftes-categoria-1-extracao-e-tratamento-de-minerais-1-5-perfuracao-de-pocos-e-producao-de-petroleo-e-gas-natural",
  "ftes-categoria-1-extracao-e-tratamento-de-minerais-1-7-lavra-garimpeira-2013-decreto-no-97-507-1989-utilizacao-de-mercurio-metalico",
  "titulo-ftes-categoria-2-industria-de-produtos-minerais-nao-metalicos-2-1-beneficiamento-de-minerais-nao-metalicos-nao-associados-a-extracao",
  "titulo-ftes-categoria-2-industria-de-produtos-minerais-nao-metalicos-2-2-fabricacao-e-elaboracao-de-produtos-minerais-nao-metalicos-tais-como-producao-de-material-ceramico-cimento-gesso-amianto-vidro-e-similares",
  "ftes-categoria-3-industria-metalurgica-3-1-fabricacao-de-aco-e-de-produtos-siderurgicos",
  "ftes-categoria-3-industria-metalurgica-3-2-producao-de-fundidos-de-ferro-e-aco-forjados-arames-relaminados-com-ou-sem-tratamento-de-superficie-inclusive-galvanoplastia",
  "ftes-categoria-3-industria-metalurgica-3-3-metalurgia-dos-metais-nao-ferrosos-em-formas-primarias-e-secundarias-inclusive-ouro",
  "ftes-categoria-3-industria-metalurgica-3-4-producao-de-laminados-ligas-artefatos-de-metais-nao-ferrosos-com-ou-sem-tratamento-de-superficie-inclusive-galvanoplastia",
  "ftes-categoria-3-industria-metalurgica-3-5-relaminacao-de-metais-nao-ferrosos-inclusive-ligas",
  "ftes-categoria-3-industria-metalurgica-3-6-producao-de-soldas-e-anodos",
  "ftes-categoria-3-industria-metalurgica-3-7-metalurgia-de-metais-preciosos",
  "ftes-categoria-3-industria-metalurgica-3-8-metalurgia-do-po-inclusive-pecas-moldadas",
  "ftes-categoria-3-industria-metalurgica-3-9-fabricacao-de-estruturas-metalicas-com-ou-sem-tratamento-de-superficie-inclusive-galvanoplastia",
  "ftes-categoria-3-industria-metalurgica-3-10-fabricacao-de-artefatos-de-ferro-aco-e-de-metais-nao-ferrosos-com-ou-sem-tratamento-de-superficie-inclusive-galvanoplastia",
  "ftes-categoria-3-industria-metalurgica-3-11-tempera-e-cementacao-de-aco-recozimento-de-arames-tratamento-de-superficie",
  "ftes-categoria-3-industria-metalurgica-3-12-metalurgia-de-metais-preciosos-2013-decreto-no-97-634-1989-utilizacao-de-mercurio-metalico",
  "ftes-categoria-4-industria-mecanica-4-1-fabricacao-de-maquinas-aparelhos-pecas-utensilios-e-acessorios-com-e-sem-tratamento-termico-ou-de-superficie",
  "titulo-ftes-categoria-5-industria-de-material-eletrico-eletronico-e-comunicacoes-5-1-fabricacao-de-pilhas-baterias-e-outros-acumuladores",
  "ftes-categoria-5-industria-de-material-eletrico-eletronico-e-comunicacoes-5-2-fabricacao-de-material-eletrico-eletronico-e-equipamentos-para-telecomunicacao-e-informatica",
  "ftes-categoria-5-industria-de-material-eletrico-eletronico-e-comunicacoes-5-3-fabricacao-de-aparelhos-eletricos-e-eletrodomesticos",
  "ftes-categoria-5-industria-de-material-eletrico-eletronico-e-comunicacoes-5-4-fabricacao-de-material-eletrico-eletronico-e-equipamentos-para-telecomunicacao-e-informatica-lei-no-12-305-2010-art-33-v-lampadas-fluorescentes-de-vapor-de-sodio-e-mercurio-e-de",
  "ftes-categoria-6-industria-de-material-de-transporte-6-1-fabricacao-e-montagem-de-veiculos-rodoviarios-e-ferroviarios-pecas-e-acessorios",
  "ftes-categoria-6-industria-de-material-de-transporte-6-2-fabricacao-e-montagem-de-aeronaves",
  "ftes-categoria-6-industria-de-material-de-transporte-6-3-fabricacao-e-reparo-de-embarcacoes-e-estruturas-flutuantes",
  "titulo-ftes-categoria-7-industria-de-madeira-7-1-serraria-e-desdobramento-de-madeira",
  "ftes-categoria-7-industria-de-madeira-7-2-preservacao-de-madeira",
  "ftes-categoria-7-industria-de-madeira-7-3-fabricacao-de-chapas-placas-de-madeira-aglomerada-prensada-e-compensada",
  "ftes-categoria-7-industria-de-madeira-7-4-fabricacao-de-estruturas-de-madeira-e-moveis",
  "ftes-categoria-8-industria-de-papel-e-celulose-8-1-fabricacao-de-celulose-e-pasta-mecanica",
  "ftes-categoria-8-industria-de-papel-e-celulose-8-2-fabricacao-de-papel-e-papelao",
  "ftes-categoria-8-industria-de-papel-e-celulose-8-3-fabricacao-de-artefatos-de-papel-papelao-cartolina-cartao-e-fibra-prensada",
  "ftes-categoria-9-industria-de-borracha-9-1-beneficiamento-de-borracha-natural",
  "ftes-categoria-9-industria-de-borracha-9-3-fabricacao-de-laminados-e-fios-de-borracha",
  "ftes-categoria-9-industria-de-borracha-9-4-fabricacao-de-espuma-de-borracha-e-de-artefatos-de-espuma-de-borracha-inclusive-latex",
  "ftes-categoria-9-industria-de-borracha-6-5-fabricacao-de-camara-de-ar",
  "ftes-categoria-9-industria-de-borracha-9-6-fabricacao-de-pneumaticos",
  "ftes-categoria-9-industria-de-borracha-9-7-recondicionamento-de-pneumaticos",
  "titulo-ftes-categoria-10-industria-de-couros-e-peles-10-1-secagem-e-salga-de-couros-e-peles",
  "ftes-categoria-10-industria-de-couros-e-peles-10-2-curtimento-e-outras-preparacoes-de-couros-e-peles",
  "ftes-categoria-10-industria-de-couros-e-peles-10-3-fabricacao-de-artefatos-diversos-de-couros-e-peles",
  "ftes-categoria-10-industria-de-couros-e-peles-10-4-fabricacao-de-cola-animal",
  "ftes-categoria-11-industria-textil-de-vestuario-calcados-e-artefatos-de-tecidos-11-1-beneficiamento-de-fibras-texteis-vegetais-de-origem-animal-e-sinteticos",
  "ftes-categoria-11-industria-textil-de-vestuario-calcados-e-artefatos-de-tecidos-11-2-fabricacao-e-acabamento-de-fios-e-tecidos",
  "ftes-categoria-11-industria-textil-de-vestuario-calcados-e-artefatos-de-tecidos-11-3-tingimento-estamparia-e-outros-acabamentos-em-pecas-do-vestuario-e-artigos-diversos-de-tecidos",
  "ftes-categoria-11-industria-textil-de-vestuario-calcados-e-artefatos-de-tecidos-11-4-fabricacao-de-calcados-e-componentes-para-calcados",
  "titulo-ftes-categoria-12-industria-de-produtos-de-materia-plastica-12-1-fabricacao-de-laminados-plasticos",
  "ftes-categoria-12-industria-de-produtos-de-materia-plastica-12-2-fabricacao-de-artefatos-de-material-plastico",
  "ftes-categoria-13-industria-do-fumo-13-1-fabricacao-de-cigarros-charutos-cigarrilhas-e-outras-atividades-de-beneficiamento-do-fumo",
  "ftes-categoria-14-industrias-diversas-14-1-usinas-de-producao-de-concreto",
  "ftes-categoria-14-industrias-diversas-14-2-usinas-de-producao-de-asfalto",
  "ftes-categoria-15-industria-quimica-15-1-producao-de-substancias-e-fabricacao-de-produtos-quimicos",
  "ftes-categoria-15-industria-quimica-15-2-fabricacao-de-produtos-derivados-do-processamento-de-petroleo-de-rochas-betuminosas-e-da-madeira",
  "ftes-categoria-15-industria-quimica-15-3-fabricacao-de-combustiveis-nao-derivados-de-petroleo",
  "ftes-categoria-15-industria-quimica-15-4-producao-de-oleos-gorduras-ceras-vegetais-e-animais-oleos-essenciais-vegetais-e-produtos-similares-da-destilacao-da-madeira",
  "ftes-categoria-15-industria-quimica-15-5-fabricacao-de-resinas-e-de-fibras-e-fios-artificiais-e-sinteticos-e-de-borracha-e-latex-sinteticos",
  "ftes-categoria-15-industria-quimica-15-6-fabricacao-de-polvora-explosivos-detonantes-municao-para-caca-e-desporto-fosforo-de-seguranca-e-artigos-pirotecnicos",
  "ftes-categoria-9-industria-de-borracha-9-7-recondicionamento-de-pneumaticos",
  "titulo-ftes-categoria-10-industria-de-couros-e-peles-10-1-secagem-e-salga-de-couros-e-peles",
  "ftes-categoria-10-industria-de-couros-e-peles-10-2-curtimento-e-outras-preparacoes-de-couros-e-peles",
  "ftes-categoria-10-industria-de-couros-e-peles-10-3-fabricacao-de-artefatos-diversos-de-couros-e-peles",
  "ftes-categoria-10-industria-de-couros-e-peles-10-4-fabricacao-de-cola-animal",
  "ftes-categoria-11-industria-textil-de-vestuario-calcados-e-artefatos-de-tecidos-11-1-beneficiamento-de-fibras-texteis-vegetais-de-origem-animal-e-sinteticos",
  "ftes-categoria-11-industria-textil-de-vestuario-calcados-e-artefatos-de-tecidos-11-2-fabricacao-e-acabamento-de-fios-e-tecidos",
  "ftes-categoria-11-industria-textil-de-vestuario-calcados-e-artefatos-de-tecidos-11-3-tingimento-estamparia-e-outros-acabamentos-em-pecas-do-vestuario-e-artigos-diversos-de-tecidos",
  "ftes-categoria-11-industria-textil-de-vestuario-calcados-e-artefatos-de-tecidos-11-4-fabricacao-de-calcados-e-componentes-para-calcados",
  "titulo-ftes-categoria-12-industria-de-produtos-de-materia-plastica-12-1-fabricacao-de-laminados-plasticos",
  "ftes-categoria-12-industria-de-produtos-de-materia-plastica-12-2-fabricacao-de-artefatos-de-material-plastico",
  "ftes-categoria-13-industria-do-fumo-13-1-fabricacao-de-cigarros-charutos-cigarrilhas-e-outras-atividades-de-beneficiamento-do-fumo",
  "ftes-categoria-14-industrias-diversas-14-1-usinas-de-producao-de-concreto",
  "ftes-categoria-14-industrias-diversas-14-2-usinas-de-producao-de-asfalto",
  "ftes-categoria-15-industria-quimica-15-1-producao-de-substancias-e-fabricacao-de-produtos-quimicos",
  "ftes-categoria-15-industria-quimica-15-2-fabricacao-de-produtos-derivados-do-processamento-de-petroleo-de-rochas-betuminosas-e-da-madeira",
  "ftes-categoria-15-industria-quimica-15-3-fabricacao-de-combustiveis-nao-derivados-de-petroleo",
  "ftes-categoria-15-industria-quimica-15-4-producao-de-oleos-gorduras-ceras-vegetais-e-animais-oleos-essenciais-vegetais-e-produtos-similares-da-destilacao-da-madeira",
  "ftes-categoria-15-industria-quimica-15-5-fabricacao-de-resinas-e-de-fibras-e-fios-artificiais-e-sinteticos-e-de-borracha-e-latex-sinteticos",
  "ftes-categoria-15-industria-quimica-15-6-fabricacao-de-polvora-explosivos-detonantes-municao-para-caca-e-desporto-fosforo-de-seguranca-e-artigos-pirotecnicos",
  "ftes-categoria-15-industria-quimica-15-7-recuperacao-e-refino-de-solventes-oleos-minerais-vegetais-e-animais",
  "ftes-categoria-15-industria-quimica-15-8-fabricacao-de-concentrados-aromaticos-naturais-artificiais-e-sinteticos",
  "ftes-categoria-15-industria-quimica-15-9-fabricacao-de-preparados-para-limpeza-e-polimento-desinfetantes-inseticidas-germicidas-e-fungicidas",
  "ftes-categoria-15-industria-quimica-15-10-fabricacao-de-tintas-esmaltes-lacas-vernizes-impermeabilizantes-solventes-e-secantes",
  "ftes-categoria-15-industria-quimica-15-11-fabricacao-de-fertilizantes-e-agroquimicos",
  "ftes-categoria-15-industria-quimica-15-12-fabricacao-de-produtos-farmaceuticos-e-veterinarios",
  "ftes-categoria-15-industria-quimica-15-13-fabricacao-de-saboes-detergentes-e-velas",
  "ftes-categoria-15-industria-quimica-15-14-fabricacao-de-perfumarias-e-cosmeticos",
  "ftes-categoria-15-industria-quimica-15-15-producao-de-alcool-etilico-metanol-e-similares",
  "ftes-categoria-15-industria-quimica-15-17-producao-de-substancias-e-fabricacao-de-produtos-quimicos-preservativos-de-madeira",
  "ftes-categoria-15-industria-quimica-15-20-producao-de-substancias-e-fabricacao-de-produtos-quimicos-utilizacao-de-mercurio-metalico",
  "ftes-categoria-15-industria-quimica-15-21-producao-de-substancias-e-fabricacao-de-produtos-quimicos-remediador-dispersante-quimico",
  "ftes-categoria-15-industria-quimica-15-23-fabricacao-de-produtos-derivados-do-processamento-de-petroleo-de-rochas-betuminosas-e-da-madeira-rerrefino-de-oleo-lubrificante-usado-ou-contaminado",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-1-beneficiamento-moagem-torrefacao-e-fabricacao-de-produtos-alimentares",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-2-matadouros-abatedouros-frigorificos-charqueadas-e-derivados-de-origem-animal",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-3-fabricacao-de-conservas",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-4-preparacao-de-pescados-e-fabricacao-de-conservas-de-pescados",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-5-beneficiamento-e-industrializacao-de-leite-e-derivados",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-6-fabricacao-e-refinacao-de-acucar",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-7-refino-e-preparacao-de-oleo-e-gorduras-vegetais",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-8-producao-de-manteiga-cacau-gorduras-de-origem-animal-para-alimentacao",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-9-fabricacao-de-fermentos-e-leveduras",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-10-fabricacao-de-racoes-balanceadas-e-de-alimentos-preparados-para-animais",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-11-fabricacao-de-vinhos-e-vinagre",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-12-fabricacao-de-cervejas-chopes-e-maltes",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-13-fabricacao-de-bebidas-nao-alcoolicas-bem-como-engarrafamento-e-gaseificacao-e-aguas-minerais",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-14-fabricacao-de-bebidas-alcoolicas",
  "ftes-categoria-16-industria-de-produtos-alimentares-e-bebida-16-16-matadouros-abatedouros-frigorificos-charqueadas-e-derivados-de-origem-animal-fauna-silvestre-fauna-exotica",
  "ftes-categoria-17-servicos-de-utilidade-17-1-producao-de-energia-termoeletrica",
  "ftes-categoria-17-servicos-de-utilidade-17-4-destinacao-de-residuos-de-esgotos-sanitarios-e-de-residuos-solidos-urbanos-inclusive-aqueles-provenientes-de-fossas",
  "ftes-categoria-17-servicos-de-utilidade-17-5-dragagem-e-derrocamentos-em-corpos-dagua",
  "ftes-categoria-17-servicos-de-utilidade-17-57-tratamento-e-destinacao-de-residuos-industriais-liquidos-e-solidos-2013-decreto-no-7-404-2010-art-36-aproveitamento-energetico",
  "ftes-categoria-17-servicos-de-utilidade-17-58-tratamento-e-destinacao-de-residuos-industriais-liquidos-e-solidos-lei-no-12-305-2010-art-3o-viii-aterro-industrial",
  "ftes-categoria-17-servicos-de-utilidade-17-59-tratamento-e-destinacao-de-residuos-industriais-liquidos-e-solidos-lei-no-12-305-2010-art-13-i-201cf201d-201ck201d-residuos-solidos-da-industria-da-mineracao",
  "ftes-categoria-17-servicos-de-utilidade-17-60-tratamento-e-destinacao-de-residuos-industriais-liquidos-e-solidos-lei-no-12-305-2010-art-3o-xiv-reciclagem-de-residuos-solidos-da-industria-da-mineracao",
  "ftes-categoria-17-servicos-de-utilidade-17-61-disposicao-de-residuos-especiais-residuos-radiativos",
  "ftes-categoria-17-servicos-de-utilidade-17-62-disposicao-de-residuos-especiais-lei-no-12-305-2010-art-33-ii-pilhas-baterias",
  "ftes-categoria-17-servicos-de-utilidade-17-63-disposicao-de-residuos-especiais-lei-no-12-305-2010-art-33-iii-pneus",
  "ftes-categoria-17-servicos-de-utilidade-17-64-disposicao-de-residuos-especiais-lei-no-12-305-2010-art-13-i-201cg201d-residuos-de-servico-de-saude",
  "ftes-categoria-17-servicos-de-utilidade-17-65-disposicao-de-residuos-especiais-residuos-da-construcao-civil",
  "ftes-categoria-17-servicos-de-utilidade-17-66-disposicao-de-residuos-especiais-protocolo-de-montreal",
  "ftes-categoria-17-servicos-de-utilidade-17-67-recuperacao-de-areas-degradadas",
  "ftes-categoria-17-servicos-de-utilidade-17-68-recuperacao-de-areas-contaminadas",
  "ftes-categoria-17-servicos-de-utilidade-17-69-tratamento-e-destinacao-de-residuos-industriais-liquidos-e-solidos-lei-complementar-no-140-2011-art-7o-xiv-g-residuos-radiativos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-1-transporte-de-cargas-perigosas",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-2-transporte-por-dutos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-3-marinas-portos-e-aeroportos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-4-terminais-de-minerio-petroleo-e-derivados-e-produtos-quimicos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-5-deposito-de-produtos-quimicos-e-produtos-perigosos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-6-comercio-de-combustiveis-e-derivados-de-petroleo",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-1820137-comercio-de-produtos-quimicos-e-produtos-perigosos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-8-comercio-de-produtos-quimicos-e-produtos-perigosos-decreto-no-97-634-1989-mercurio-metalico",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-10-comercio-de-produtos-quimicos-e-produtos-perigosos-protocolo-de-montreal",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-13-comercio-de-produtos-quimicos-e-produtos-perigosos-resolucao-conama-no-362-2005-importacao-de-oleo-lubrificante-acabado",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-14-transporte-de-cargas-perigosas-resolucao-conama-no-362-2005-oleo-lubrificante-usado-ou-contaminado",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-17-comercio-de-produtos-quimicos-e-produtos-perigosos-convencao-de-estocolmo-pi-no-292-1989-poluentes-organicos-persistentes-preservativos-de-madeira",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-64-comercio-de-produtos-quimicos-e-produtos-perigosos-resolucao-conama-no-463-2014-resolucao-conama-no-472-2015-remediadores-dispersantes-quimicos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-66-comercio-de-produtos-quimicos-e-produtos-perigosos-lei-no-7-802-1989-agrotoxicos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-74-transporte-de-cargas-perigosas-residuos-perigosos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-79-comercio-de-produtos-quimicos-e-produtos-perigosos-decreto-no-875-1993-exportacao-de-residuos-perigosos-de-rejeitos-perigosos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-80-deposito-de-produtos-quimicos-e-produtos-perigosos-lei-no-12-305-2010-residuos-perigosos",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-81-comercio-de-produtos-quimicos-e-produtos-perigosos-resolucao-conama-no-401-2008-importacao-de-pilhas-de-baterias",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-83",
  "ftes-categoria-18-transporte-terminais-depositos-e-comercio-18-84-deposito-de-produtos-quimicos-e-produtos-perigosos-lei-complementar-no-140-2011-art-7o-xiv-g-materiais-nucleares",
  "ftes-categoria-19-turismo-19-1-complexos-turisticos-e-de-lazer-inclusive-parques-tematicos",
  "ftes-categoria-20-uso-de-recursos-naturais-20-2-exploracao-economica-da-madeira-ou-lenha-e-subprodutos-florestais",
  "ftes-categoria-20-uso-de-recursos-naturais-20-5-utilizacao-do-patrimonio-genetico-natural",
  "ftes-categoria-20-uso-de-recursos-naturais-20-6-exploracao-de-recursos-aquaticos-vivos",
  "ftes-categoria-20-uso-de-recursos-naturais-20-21-importacao-ou-exportacao-de-fauna-nativa-brasileira",
  "copy_of_ftes-categoria-20-uso-de-recursos-naturais-20-21-importacao-ou-exportacao-de-fauna-nativa-brasileira",
  "ftes-categoria-20-uso-de-recursos-naturais-20-23-atividade-de-criacao-e-exploracao-economica-de-fauna-exotica-e-de-fauna-silvestre-resolucao-conama-no-489-2018-art-4o-iv-criacao-comercial",
  "ftes-categoria-20-uso-de-recursos-naturais-20-25-atividade-de-criacao-e-exploracao-economica-de-fauna-exotica-e-de-fauna-silvestre-resolucao-conama-no-489-2018-art-4o-x-jardim-zoologico",
  "ftes-categoria-20-uso-de-recursos-naturais-20-26-introducao-de-especies-exoticas-exceto-para-melhoramento-genetico-vegetal-e-uso-na-agricultura",
  "ftes-categoria-20-uso-de-recursos-naturais-20-35-introducao-de-especies-geneticamente-modificadas-previamente-identificadas-pela-ctnbio-como-potencialmente-causadoras-de-significativa-degradacao-do-meio-ambiente",
  "ftes-categoria-20-uso-de-recursos-naturais-20-37-uso-da-diversidade-biologica-pela-biotecnologia-em-atividades-previamente-identificadas-pela-ctnbio-como-potencialmente-causadoras-de-significativa-degradacao-do-meio-ambiente",
  "ftes-categoria-20-uso-de-recursos-naturais-20-54-exploracao-de-recursos-aquaticos-vivos-lei-no-11-959-2009-art-2o-ii-aquicultura",
  "ftes-categoria-20-uso-de-recursos-naturais-20-60-silvicultura-lei-no-12-651-2012-art-35-ssss-1o-3o-especies-nativas",
  "ftes-categoria-20-uso-de-recursos-naturais-20-61-silvicultura-lei-no-12-651-2012-art-35-ss-1o-especies-exoticas",
  "ftes-categoria-20-uso-de-recursos-naturais-20-63-exploracao-economica-da-madeira-ou-lenha-e-subprodutos-florestais-instrucao-normativa-ibama-no-21-2014-art-7o-ii-coleta-de-produtos-nao-madeireiros",
  "ftes-categoria-20-uso-de-recursos-naturais-20-81-atividade-de-criacao-e-exploracao-economica-de-fauna-exotica-e-de-fauna-silvestre-resolucao-conama-no-346-2004-meliponarios",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-3-utilizacao-tecnica-de-substancias-controladas-2013-protocolo-de-montreal",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-5-experimentacao-com-agroquimicos-lei-no-7-802-1989",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-27-porte-e-uso-de-motosserra-lei-no-12-651-2012-art-69-ss-1o",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-30-operacao-de-rodovia-lei-no-6-938-1981-art-10",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-31-operacao-de-hidrovia-lei-no-6-938-1981-art-10",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-32-operacao-de-aerodromo-lei-no-6-938-1981-art-10",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-33-estacoes-de-tratamento-de-agua-lei-no-6-938-1981-art-10",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-34-transmissao-de-energia-eletrica-lei-no-6-938-1981-art-10",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-35-geracao-de-energia-hidreletrica-lei-no-6-938-1981-art-10",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-36-geracao-de-energia-eolica-e-de-outras-fontes-alternativas-lei-no-6-938-1981-art-10",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-37-distribuicao-de-energia-eletrica-lei-no-6-938-1981-art-10",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-40-comercio-exterior-de-residuos-controlados-decreto-no-875-1993",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-41-importacao-de-lampadas-fluorescentes-de-vapor-de-sodio-e-mercurio-e-de-luz-mista-lei-no-12-305-2010",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-42-importacao-de-eletrodomesticos-resolucao-conama-no-20-1994",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-43-importacao-de-veiculos-automotores-para-uso-proprio-lei-no-8-723-1993",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-44-importacao-de-veiculos-automotores-para-fins-de-comercializacao-lei-no-8-723-1993",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-45-importacao-de-pneus-e-similares-resolucao-conama-no-416-2009",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-46-controle-de-plantas-aquaticas-resolucao-conama-no-467-2015",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-47-aplicacao-de-agrotoxicos-e-afins-lei-no-7-802-1989",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-48-consumo-industrial-de-madeira-de-lenha-e-de-carvao-vegetal-lei-no-12-651-2012-art-34",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-49-transporte-de-produtos-florestais-lei-no-12-651-2012-art-36",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-50-armazenamento-de-produtos-florestais-lei-no-12-651-2012-art-36",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-51-formulacao-de-produtos-biorremediadores-resolucao-conama-no-463-2014",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-52-centro-de-triagem-e-reabilitacao-resolucao-conama-no-489-2018-art-4o-ii",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-53-manutencao-de-fauna-silvestre-ou-exotica-resolucao-conama-no-489-2018-art-4o-ix",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-55-criacao-cientifica-de-fauna-exotica-e-de-fauna-silvestre-resolucao-conama-no-489-2018-art-4o-iii",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-56-criacao-conservacionista-de-fauna-silvestre-resolucao-conama-no-489-2018-art-4o-v",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-57-importacao-ou-exportacao-de-fauna-exotica-portaria-ibama-no-93-1998",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-58-manejo-de-fauna-exotica-invasora-resolucao-conabio-no-7-2018",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-59-manejo-de-fauna-sinantropica-nociva-instrucao-normativa-ibama-no-141-2006",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-60-criacao-amadorista-de-passeriformes-da-fauna-silvestre-instrucao-normativa-ibama-no-10-2011",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-64-exportacao-de-carvao-vegetal-de-especies-exoticas-instrucao-normativa-ibama-no-15-2011-art-2o-ss-1o",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-66-producao-de-agrotoxicos-de-agentes-biologicos-e-microbiologicos-de-controle-lei-no-7-802-1989",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-67-comercio-atacadista-de-madeira-de-lenha-e-de-outros-produtos-florestais-lei-no-12-651-2012-art-37",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-68-comercio-varejista-de-madeira-de-lenha-e-de-outros-produtos-florestais-lei-no-12-651-2012-art-37",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-69-comercializacao-de-recursos-pesqueiros-lei-no-11-959-2009-art-3o-x-art-31",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-70-revenda-de-organismos-aquaticos-vivos-ornamentais-lei-no-11-959-2009-art-3o-x-art-31",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-71-empreendimento-comercial-de-animais-vivos-da-fauna-silvestre-ou-fauna-resolucao-conama-no-489-2018-art-4o-vii",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-72-empreendimento-comercial-de-partes-produtos-e-subprodutos-da-fauna-silvestre-ou-exotica-resolucao-conama-no-489-2018-art-4o",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-73-comercializacao-de-motosserra-lei-no-12-651-2012-art-69",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-49-transporte-de-produtos-florestais-lei-no-12-651-2012-art-36",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-50-armazenamento-de-produtos-florestais-lei-no-12-651-2012-art-36",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-51-formulacao-de-produtos-biorremediadores-resolucao-conama-no-463-2014",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-52-centro-de-triagem-e-reabilitacao-resolucao-conama-no-489-2018-art-4o-ii",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-53-manutencao-de-fauna-silvestre-ou-exotica-resolucao-conama-no-489-2018-art-4o-ix",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-55-criacao-cientifica-de-fauna-exotica-e-de-fauna-silvestre-resolucao-conama-no-489-2018-art-4o-iii",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-56-criacao-conservacionista-de-fauna-silvestre-resolucao-conama-no-489-2018-art-4o-v",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-57-importacao-ou-exportacao-de-fauna-exotica-portaria-ibama-no-93-1998",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-58-manejo-de-fauna-exotica-invasora-resolucao-conabio-no-7-2018",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-59-manejo-de-fauna-sinantropica-nociva-instrucao-normativa-ibama-no-141-2006",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-60-criacao-amadorista-de-passeriformes-da-fauna-silvestre-instrucao-normativa-ibama-no-10-2011",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-64-exportacao-de-carvao-vegetal-de-especies-exoticas-instrucao-normativa-ibama-no-15-2011-art-2o-ss-1o",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-66-producao-de-agrotoxicos-de-agentes-biologicos-e-microbiologicos-de-controle-lei-no-7-802-1989",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-67-comercio-atacadista-de-madeira-de-lenha-e-de-outros-produtos-florestais-lei-no-12-651-2012-art-37",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-68-comercio-varejista-de-madeira-de-lenha-e-de-outros-produtos-florestais-lei-no-12-651-2012-art-37",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-69-comercializacao-de-recursos-pesqueiros-lei-no-11-959-2009-art-3o-x-art-31",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-70-revenda-de-organismos-aquaticos-vivos-ornamentais-lei-no-11-959-2009-art-3o-x-art-31",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-71-empreendimento-comercial-de-animais-vivos-da-fauna-silvestre-ou-fauna-resolucao-conama-no-489-2018-art-4o-vii",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-72-empreendimento-comercial-de-partes-produtos-e-subprodutos-da-fauna-silvestre-ou-exotica-resolucao-conama-no-489-2018-art-4o",
  "ftes-categoria-21-atividades-sujeitas-a-controle-e-fiscalizacao-ambiental-nao-relacionadas-no-anexo-viii-da-lei-no-6-938-1981-21-73-comercializacao-de-motosserra-lei-no-12-651-2012-art-69",
]

# Initialize the main data structure
all_fte_data = []
# Track URLs where no FTE links were found for debugging
no_fte_links_urls = []

for url in urls:
    url = baseUrl + url
    print(f"\n{'='*80}\nProcessing URL: {url}\n{'='*80}")
    print(f"URL: {url}")

    # Get the main page
    soup = get_page_content(url)
    if not soup:
        # Save information about inaccessible pages
        no_fte_links_urls.append({
            "url": url,
            "timestamp": str(datetime.datetime.now()),
            "status": "Page not accessible",
            "page_title": "N/A",
            "page_accessible": False,
            "total_links_on_page": 0,
            "links_with_plgBotao_class": 0,
            "sample_links": []
        })
        continue
    
    # Add delay between requests to avoid overwhelming the server
    time.sleep(2)

    # Find FTE links
    fte_links = find_fte_links(soup)

    if not fte_links:
        print("No FTE links found on this page")
        # Save this URL for debugging with more details
        page_info = {
            "url": url,
            "timestamp": str(datetime.datetime.now()),
            "status": "No FTE links found",
            "page_title": soup.title.string if soup.title else "No title",
            "page_accessible": True,
            "total_links_on_page": len(soup.find_all('a')),
            "links_with_plgBotao_class": len(soup.find_all('a', class_='plgBotao')),
            "sample_links": []
        }
        
        # Add some sample links to help debug
        for link in soup.find_all('a')[:10]:  # First 10 links
            if link.get('href') and link.get_text(strip=True):
                page_info["sample_links"].append({
                    "text": link.get_text(strip=True)[:100],  # First 100 chars
                    "href": link.get('href'),
                    "class": link.get('class')
                })
        
        no_fte_links_urls.append(page_info)
        continue

    # Process each FTE link
    for fte_link in fte_links:
        print(f"\n{'='*80}\nFollowing FTE link: {fte_link}\n{'='*80}")

        # Get the FTE page content
        print(f"Attempting to retrieve content from: {fte_link}")
        fte_soup = get_page_content(fte_link)
        if not fte_soup:
            print(f"Could not retrieve content from {fte_link}. Skipping parsing.")
            continue

        # Extract and display content
        content = extract_fte_content(fte_soup)
        display(Markdown(f"**FTE Content:**\n\n```\n{content}\n```"))
        
        # Convert markdown content to JSON
        json_data = markdown_to_json(fte_soup)
        
        # Add URL as key to the data
        fte_entry = {
            "url": fte_link,
            "data": json_data
        }
        
        all_fte_data.append(fte_entry)
        
        print(f"Found {len(json_data.get('Classificação Nacional de Atividades Econômicas', []))} CNAE entries")
        
        # Add delay between FTE requests
        time.sleep(1)

# Save all FTE data to a single JSON file
with open("all_fte_data.json", 'w', encoding='utf-8') as f:
    json.dump(all_fte_data, f, indent=2, ensure_ascii=False)

# Save URLs where no FTE links were found for debugging
if no_fte_links_urls:
    with open("no_fte_links_debug.json", 'w', encoding='utf-8') as f:
        json.dump(no_fte_links_urls, f, indent=2, ensure_ascii=False)
    print(f"\nDebug info saved to: no_fte_links_debug.json")
    print(f"URLs with no FTE links: {len(no_fte_links_urls)}")
    
    # Show summary of issues
    print("\nSummary of issues found:")
    for i, issue in enumerate(no_fte_links_urls):
        print(f"  {i+1}. {issue['url']}")
        print(f"     Status: {issue['status']}")
        if issue['page_accessible']:
            print(f"     Page title: {issue['page_title']}")
            print(f"     Total links: {issue['total_links_on_page']}")
            print(f"     Links with plgBotao class: {issue['links_with_plgBotao_class']}")
        print()

print(f"\nAll FTE data saved to: all_fte_data.json")
print(f"Total FTE entries processed: {len(all_fte_data)}")
print(f"Total URLs processed: {len(urls)}")
print(f"Successful FTE extractions: {len(all_fte_data)}")
print(f"Failed/No FTE links: {len(no_fte_links_urls)}")
print("\nProcessing complete!")
