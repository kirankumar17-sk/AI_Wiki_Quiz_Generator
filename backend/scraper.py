import requests
from bs4 import BeautifulSoup

def scrape_wikipedia(url: str):
    # Wikipedia requires a User-Agent header to allow scraping
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 1. Extract Title
        title_tag = soup.find('h1', {'id': 'firstHeading'})
        title = title_tag.text if title_tag else "Unknown Title"
        
        # 2. Extract Content (Paragraphs)
        content_div = soup.find('div', {'id': 'bodyContent'})
        paragraphs = content_div.find_all('p')
        
        # Combine text, ignoring empty paragraphs
        full_text = "\n".join([p.text for p in paragraphs if p.text.strip()])
        
        # 3. Extract Summary (First 2-3 paragraphs)
        summary = "\n".join([p.text for p in paragraphs[:3] if p.text.strip()])
        
        # 4. Extract Section Headers (for structure info)
        headers = [h.text.replace('[edit]', '') for h in soup.find_all(['h2', 'h3'])]
        
        return {
            "title": title,
            "summary": summary,
            "full_text": full_text[:15000], # Limit text length for LLM token limits
            "sections": headers
        }
    except Exception as e:
        raise Exception(f"Error scraping URL: {str(e)}")