#!/usr/bin/env python3
"""
Example script demonstrating how to use the FTE Viewer Backend.

This script shows various ways to use the scraper for extracting FTE data.
"""

import json
from fte_viewer_backend import FTEScraper, extract_fte_content, markdown_to_json


def example_basic_usage():
    """Example of basic usage with the FTEScraper class."""
    print("=== Basic Usage Example ===")
    
    # Initialize the scraper
    scraper = FTEScraper()
    
    # Example URL (replace with actual FTE URL)
    url = "https://sei.ibama.gov.br/documento_consulta_externa.php?id_acesso_externo=1261093&id_documento=18550666&infra_hash=74d48482f43654c143367dc78e20a0fa"
    
    print(f"Scraping FTE data from: {url}")
    
    # Get page content
    soup = scraper.get_page_content(url)
    if soup:
        print("✓ Successfully retrieved page content")
        
        # Extract content
        content = scraper.extract_fte_content(soup)
        print(f"✓ Extracted content length: {len(content)} characters")
        
        # Convert to JSON
        json_data = scraper.markdown_to_json(soup)
        print(f"✓ Converted to JSON with {len(json_data.get('sections', []))} sections")
        
        # Save to file
        with open("example_output.json", "w", encoding="utf-8") as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        print("✓ Saved to example_output.json")
        
    else:
        print("✗ Failed to retrieve page content")


def example_standalone_functions():
    """Example using standalone functions."""
    print("\n=== Standalone Functions Example ===")
    
    # Example HTML content
    sample_html = """
    <html>
        <body>
            <table border="1">
                <tr>
                    <td>Código:</td>
                    <td>FTE-EXAMPLE-001</td>
                </tr>
                <tr>
                    <td>Descrição:</td>
                    <td>Example FTE Description</td>
                </tr>
                <tr>
                    <td>Versão FTE:</td>
                    <td>1.0</td>
                </tr>
            </table>
        </body>
    </html>
    """
    
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(sample_html, 'html.parser')
    
    # Use standalone functions
    content = extract_fte_content(soup)
    print(f"✓ Extracted content: {content[:100]}...")
    
    json_data = markdown_to_json(soup)
    print(f"✓ JSON metadata: {json_data.get('metadata', {})}")


def example_batch_processing():
    """Example of processing multiple URLs."""
    print("\n=== Batch Processing Example ===")
    
    # Example URLs (replace with actual URLs)
    urls = [
        "https://sei.ibama.gov.br/documento_consulta_externa.php?id_acesso_externo=1261093&id_documento=18550666&infra_hash=74d48482f43654c143367dc78e20a0fa",
        # Add more URLs here
    ]
    
    scraper = FTEScraper()
    
    print(f"Processing {len(urls)} URLs...")
    
    # Process each URL individually
    for i, url in enumerate(urls, 1):
        print(f"\nProcessing URL {i}/{len(urls)}: {url}")
        
        soup = scraper.get_page_content(url)
        if soup:
            # Find FTE links
            fte_links = scraper.find_fte_links(soup)
            print(f"  ✓ Found {len(fte_links)} FTE links")
            
            # Process each FTE link
            for j, fte_link in enumerate(fte_links, 1):
                print(f"    Processing FTE {j}/{len(fte_links)}: {fte_link}")
                
                fte_soup = scraper.get_page_content(fte_link)
                if fte_soup:
                    json_data = scraper.markdown_to_json(fte_soup)
                    cnae_count = len(json_data.get('Classificação Nacional de Atividades Econômicas', []))
                    print(f"      ✓ Extracted {cnae_count} CNAE entries")
                else:
                    print(f"      ✗ Failed to retrieve FTE content")
        else:
            print(f"  ✗ Failed to retrieve page content")


def example_custom_configuration():
    """Example of custom scraper configuration."""
    print("\n=== Custom Configuration Example ===")
    
    # Custom configuration
    custom_scraper = FTEScraper(
        base_url="https://custom.gov.br"
    )
    
    print(f"✓ Custom scraper initialized with base URL: {custom_scraper.base_url}")
    
    # You can also customize the session
    custom_scraper.session.headers.update({
        'User-Agent': 'Custom FTE Scraper/1.0'
    })
    
    print("✓ Custom User-Agent set")


def main():
    """Main function to run all examples."""
    print("FTE Viewer Backend - Usage Examples")
    print("=" * 50)
    
    try:
        # Run examples
        example_basic_usage()
        example_standalone_functions()
        example_batch_processing()
        example_custom_configuration()
        
        print("\n" + "=" * 50)
        print("✓ All examples completed successfully!")
        print("\nNext steps:")
        print("1. Replace example URLs with actual FTE URLs")
        print("2. Customize the scraper configuration as needed")
        print("3. Run the scraper on your data")
        print("4. Check the output files for results")
        
    except Exception as e:
        print(f"\n✗ Error running examples: {e}")
        print("Make sure you have installed the required dependencies:")
        print("pip install -r requirements.txt")


if __name__ == "__main__":
    main()
