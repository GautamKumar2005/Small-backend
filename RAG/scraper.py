import time
import json
import logging
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class PoliteScraper:
    def __init__(self, base_url, user_agent, delay=2.0):
        """
        Initializes the scraper with politeness constraints.
        """
        self.base_url = base_url
        self.user_agent = user_agent
        self.delay = delay
        self.session = requests.Session()
        
        # Add retry logic for resilience against network blips
        retries = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
        adapter = HTTPAdapter(max_retries=retries)
        self.session.mount('http://', adapter)
        self.session.mount('https://', adapter)
        
        self.session.headers.update({'User-Agent': self.user_agent})
        
        # Initialize robot parser
        self.rp = RobotFileParser()
        self._setup_robots()
        
        self.visited = set()

    def _setup_robots(self):
        """
        Fetches and parses the robots.txt file for the domain.
        """
        parsed = urlparse(self.base_url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        logging.info(f"Fetching robots.txt from {robots_url}")
        try:
            self.rp.set_url(robots_url)
            self.rp.read()
        except Exception as e:
            logging.warning(f"Could not read robots.txt: {e}")

    def can_fetch(self, url):
        """
        Checks if robots.txt allows scraping the given URL.
        """
        # Built-in RobotFileParser is sometimes strict if robots.txt isn't parsed well,
        # but usually it works fine for standard sites.
        if not self.rp.mtime():
             # If robots.txt wasn't found or couldn't be loaded, we default to assuming it's allowed
             return True
        return self.rp.can_fetch(self.user_agent, url)

    def fetch(self, url):
        """
        Fetches a URL responsibly (enforcing rate limits and robots.txt).
        """
        if url in self.visited:
            return None
        
        if not self.can_fetch(url):
            logging.warning(f"Scraping disallowed by robots.txt for: {url}")
            return None
            
        logging.info(f"Fetching {url}")
        time.sleep(self.delay)  # Be nice, enforce rate limit
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            self.visited.add(url)
            return response.text
        except requests.RequestException as e:
            logging.error(f"Failed to fetch {url}: {e}")
            return None

    def scrape_quotes(self, output_file="output.jsonl"):
        """
        Domain-specific scraping logic for quotes.toscrape.com
        """
        current_url = self.base_url
        
        with open(output_file, 'w', encoding='utf-8') as f:
            while current_url:
                html = self.fetch(current_url)
                if not html:
                    break
                    
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract fields
                quotes = soup.find_all('div', class_='quote')
                for q in quotes:
                    raw_text = q.find('span', class_='text').get_text(strip=True)
                    # Clean up the stylized quotes and any lingering whitespace
                    text = raw_text.strip('“”"\' \t\n\r')
                    
                    author = q.find('small', class_='author').get_text(strip=True)
                    tags = [tag.get_text(strip=True) for tag in q.find_all('a', class_='tag')]
                    
                    record = {
                        'text': text,
                        'author': author,
                        'tags': tags,
                        'source_url': current_url,
                        'scraped_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                    }
                    
                    # Save structured record as JSONL
                    f.write(json.dumps(record, ensure_ascii=False) + '\n')
                    
                # Find next page
                next_btn = soup.find('li', class_='next')
                if next_btn:
                    next_link = next_btn.find('a')['href']
                    current_url = urljoin(self.base_url, next_link)
                else:
                    current_url = None
                    
        logging.info(f"Scraping complete. {len(self.visited)} pages visited. Data saved to {output_file}")

if __name__ == "__main__":
    # Example usage on a known practice site
    TARGET_URL = "http://quotes.toscrape.com/"
    USER_AGENT = "MyRagBot/1.0 (Student Project)"
    
    # Using 1 second delay to be respectful but not too slow for the workshop
    scraper = PoliteScraper(base_url=TARGET_URL, user_agent=USER_AGENT, delay=1.0)
    
    # Save output to RAG corpus format (JSONL)
    scraper.scrape_quotes(output_file="corpus.jsonl")
