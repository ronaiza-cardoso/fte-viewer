import json
from collections import defaultdict

def analyze_fte_versions():
    """Analyze FTE data to find codes with multiple versions"""
    
    try:
        # Load the FTE data
        with open('all_fte_data.json', 'r', encoding='utf-8') as f:
            fte_data = json.load(f)
        
        print(f"Total FTE entries loaded: {len(fte_data)}")
        
        # Group by código
        codigo_groups = defaultdict(list)
        
        for item in fte_data:
            codigo = item['data']['metadata'].get('Código:', 'N/A')
            version = item['data']['metadata'].get('Versão FTE:', 'N/A')
            
            codigo_groups[codigo].append({
                'version': version,
                'url': item['url'],
                'descricao': item['data']['metadata'].get('Descrição:', 'N/A')
            })
        
        # Find codes with multiple versions
        multi_version_codes = {}
        single_version_codes = {}
        
        for codigo, versions in codigo_groups.items():
            if len(versions) > 1:
                multi_version_codes[codigo] = versions
            else:
                single_version_codes[codigo] = versions
        
        print(f"\n{'='*80}")
        print(f"ANALYSIS RESULTS")
        print(f"{'='*80}")
        print(f"Total unique codes: {len(codigo_groups)}")
        print(f"Codes with single version: {len(single_version_codes)}")
        print(f"Codes with multiple versions: {len(multi_version_codes)}")
        
        if multi_version_codes:
            print(f"\n{'='*80}")
            print(f"CODES WITH MULTIPLE VERSIONS")
            print(f"{'='*80}")
            
            for codigo, versions in multi_version_codes.items():
                print(f"\nFTE - {codigo}")
                print(f"Total versions: {len(versions)}")
                print("-" * 50)
                
                # Sort versions by version number
                sorted_versions = sorted(versions, key=lambda x: parse_version(x['version']))
                
                for i, version_info in enumerate(sorted_versions):
                    if i == 0:
                        print(f"  → Versão: {version_info['version']} (mais antiga)")
                    elif i == len(sorted_versions) - 1:
                        print(f"  → Versão: {version_info['version']} (mais recente)")
                    else:
                        print(f"  → Versão: {version_info['version']}")
                    
                    print(f"    Descrição: {version_info['descricao']}")
                    print(f"    URL: {version_info['url']}")
                    print()
        
        # Summary statistics
        print(f"\n{'='*80}")
        print(f"SUMMARY STATISTICS")
        print(f"{'='*80}")
        
        version_counts = [len(versions) for versions in codigo_groups.values()]
        if version_counts:
            max_versions = max(version_counts)
            min_versions = min(version_counts)
            avg_versions = sum(version_counts) / len(version_counts)
            
            print(f"Maximum versions per code: {max_versions}")
            print(f"Minimum versions per code: {min_versions}")
            print(f"Average versions per code: {avg_versions:.2f}")
        
        # Show some examples of single version codes
        if single_version_codes:
            print(f"\n{'='*80}")
            print(f"EXAMPLES OF SINGLE VERSION CODES (first 5)")
            print(f"{'='*80}")
            
            for i, (codigo, versions) in enumerate(list(single_version_codes.items())[:5]):
                print(f"{i+1}. FTE - {codigo}")
                print(f"   Versão: {versions[0]['version']}")
                print(f"   Descrição: {versions[0]['descricao']}")
                print()
        
        return multi_version_codes
        
    except FileNotFoundError:
        print("Error: all_fte_data.json not found. Please run the scraper first.")
        return None
    except Exception as e:
        print(f"Error analyzing data: {e}")
        return None

def parse_version(version_str):
    """Parse version string to numeric value for sorting"""
    try:
        # Remove non-numeric characters except dots
        clean_version = ''.join(c for c in version_str if c.isdigit() or c == '.')
        return float(clean_version) if clean_version else 0.0
    except:
        return 0.0

if __name__ == "__main__":
    multi_version_codes = analyze_fte_versions()
    
    if multi_version_codes:
        print(f"\n{'='*80}")
        print(f"EXPORTING MULTI-VERSION CODES TO JSON")
        print(f"{'='*80}")
        
        # Export to JSON for further analysis
        with open('multi_version_codes.json', 'w', encoding='utf-8') as f:
            json.dump(multi_version_codes, f, indent=2, ensure_ascii=False)
        
        print("Multi-version codes exported to: multi_version_codes.json")
