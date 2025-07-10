import requests
from bs4 import BeautifulSoup
import time
import urllib.parse
from typing import Set, Dict, List, AsyncIterator, DefaultDict
import logging
import asyncio
import aiohttp
from asyncio import Semaphore
from datetime import datetime
from dataclasses import dataclass
from collections import defaultdict
import os
import json
from aiofiles import open as aio_open
import re

# Configuration
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; URLExtractorBot/1.0)"
}
REQUEST_TIMEOUT = 10
REQUEST_DELAY = 0.5
MAX_RETRIES = 3
TARGET_KEYWORD = "go.recordedfuture.com"
MAX_CONCURRENT_REQUESTS = 5  # Limit concurrent requests
MAX_SITEMAP_DEPTH = 5  # Maximum depth for sitemap recursion
BATCH_SIZE = 100  # Number of URLs to process in each batch

# URL Filtering
URL_FILTERS = [
    # r"https://www\.recordedfuture\.com/vulnerability-database/CVE-.*",  # Filter out CVE vulnerability pages
]

# Sitemap Filtering
SITEMAP_FILTERS = [
    r"https://www\.recordedfuture\.com/sitemaps/sitemap\.xml",  # Filter out sitemap from Strappi
    # r"https://www\.recordedfuture\.com/vulnerability-database/vuln-sitemap\.xml",  # Filter out main vulnerability sitemap
    # r"https://www\.recordedfuture\.com/vulnerability-database/sitemap/cves/cves-\d+\.xml",  # Filter out CVE sitemap files
    # r"https://www\.recordedfuture\.com/sitemaps/sitemap-(fr|de|jp|ko)\.xml",  # Filter out localised sitemap files
]

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class FilterStats:
    pattern: str
    count: int = 0
    description: str = ""
    filter_type: str = "URL"  # "URL" or "Sitemap"

    def __str__(self) -> str:
        return f"{self.description} ({self.filter_type}): {self.count} items"

class FilterMetrics:
    def __init__(self):
        self.stats: Dict[str, FilterStats] = {}
        # Initialize URL filter stats
        for pattern in URL_FILTERS:
            description = next((line.strip() for line in pattern.split('#') if line.strip()), pattern)
            self.stats[pattern] = FilterStats(pattern=pattern, description=description, filter_type="URL")
        # Initialize Sitemap filter stats
        for pattern in SITEMAP_FILTERS:
            description = next((line.strip() for line in pattern.split('#') if line.strip()), pattern)
            self.stats[pattern] = FilterStats(pattern=pattern, description=description, filter_type="Sitemap")

    def increment(self, pattern: str):
        if pattern in self.stats:
            self.stats[pattern].count += 1

    def get_total_skipped(self) -> int:
        return sum(stat.count for stat in self.stats.values())

    def get_top_filters(self, limit: int = 3, filter_type: str = None) -> List[FilterStats]:
        filtered_stats = [stat for stat in self.stats.values() if filter_type is None or stat.filter_type == filter_type]
        return sorted(filtered_stats, key=lambda x: x.count, reverse=True)[:limit]

def should_process_url(url: str, filter_metrics: FilterMetrics) -> bool:
    """Check if the URL should be processed based on filter patterns."""
    for pattern in URL_FILTERS:
        if re.match(pattern, url):
            filter_metrics.increment(pattern)
            logger.info(f"Skipping URL matching pattern '{pattern}': {url}")
            return False
    return True

def should_process_sitemap(sitemap_url: str, filter_metrics: FilterMetrics) -> bool:
    """Check if the sitemap should be processed based on filter patterns."""
    for pattern in SITEMAP_FILTERS:
        if re.match(pattern, sitemap_url):
            filter_metrics.increment(pattern)
            logger.info(f"Skipping sitemap matching pattern '{pattern}': {sitemap_url}")
            return False
    return True

@dataclass
class CrawlResults:
    """Class to store and manage crawl results."""
    target_links: DefaultDict[str, Set[str]] = None  # go.recordedfuture.com links -> set of source pages
    temp_file: str = None
    
    def __post_init__(self):
        if self.target_links is None:
            self.target_links = defaultdict(set)
        if self.temp_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.temp_file = f"crawl_results_{timestamp}_temp.json"
    
    def add_result(self, target_link: str, source_page: str):
        """Add a result, ensuring uniqueness."""
        self.target_links[target_link].add(source_page)
    
    async def write_batch(self, batch: List[Dict[str, List[str]]]):
        """Write a batch of results to the temporary file."""
        async with aio_open(self.temp_file, 'a', encoding='utf-8') as f:
            for result in batch:
                await f.write(json.dumps(result) + '\n')
    
    async def finalize_results(self, output_file: str):
        """Convert temporary JSON file to final formatted text file."""
        async with aio_open(output_file, 'w', encoding='utf-8') as out_f:
            await out_f.write(f"Crawl Results - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            await out_f.write("=" * 80 + "\n\n")
            
            # Sort target links alphabetically
            for target_link in sorted(self.target_links.keys()):
                await out_f.write(f"Target Link: {target_link}\n")
                await out_f.write(f"Found on {len(self.target_links[target_link])} pages:\n")
                for source_page in sorted(self.target_links[target_link]):
                    await out_f.write(f"  -> {source_page}\n")
                await out_f.write("\n")
        
        # Clean up temporary file
        if os.path.exists(self.temp_file):
            os.remove(self.temp_file)

@dataclass
class CrawlMetrics:
    start_time: datetime
    end_time: datetime = None
    total_sitemaps: int = 0
    total_pages: int = 0
    total_links_found: int = 0
    pages_with_links: int = 0
    failed_requests: int = 0
    filter_metrics: FilterMetrics = None
    processed_urls: Set[str] = None
    output_file: str = None
    
    def __post_init__(self):
        if self.processed_urls is None:
            self.processed_urls = set()
        if self.filter_metrics is None:
            self.filter_metrics = FilterMetrics()
        if self.output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.output_file = f"crawl_results_{timestamp}.txt"
    
    @property
    def duration(self) -> float:
        if self.end_time is None:
            return (datetime.now() - self.start_time).total_seconds()
        return (self.end_time - self.start_time).total_seconds()
    
    async def write_metrics(self, results: CrawlResults):
        """Write metrics to the output file."""
        summary = [
            "\n=== Crawl Performance Metrics ===",
            f"Total Duration: {self.duration:.2f} seconds",
            f"Total Sitemaps Processed: {self.total_sitemaps}",
            f"Total Pages Found: {self.total_pages}",
            f"Pages with Target Links: {self.pages_with_links}",
            f"Unique Target Links Found: {len(results.target_links)}",
            f"Failed Requests: {self.failed_requests}",
            f"Total Skipped Items: {self.filter_metrics.get_total_skipped()}",
            "\n=== Top URL Filters ===",
        ]
        
        # Add top URL filter statistics
        for stat in self.filter_metrics.get_top_filters(filter_type="URL"):
            summary.append(str(stat))
        
        summary.append("\n=== Top Sitemap Filters ===")
        # Add top sitemap filter statistics
        for stat in self.filter_metrics.get_top_filters(filter_type="Sitemap"):
            summary.append(str(stat))
        
        summary.extend([
            "\n=== Performance Metrics ===",
            f"Average Pages per Second: {self.total_pages / self.duration:.2f}",
            f"Average Links per Page: {self.total_links_found / self.pages_with_links if self.pages_with_links > 0 else 0:.2f}",
            "===============================\n"
        ])
        
        # Print to console
        print("\n".join(summary))
        
        # Write to file
        async with aio_open(self.output_file, 'a', encoding='utf-8') as f:
            await f.write("\n".join(summary))
            await f.write("\n")

async def fetch_url(session: aiohttp.ClientSession, url: str, semaphore: Semaphore, metrics: CrawlMetrics) -> str:
    """Fetch URL content with rate limiting using streaming."""
    async with semaphore:
        try:
            async with session.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT) as response:
                response.raise_for_status()
                return await response.text()
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            metrics.failed_requests += 1
            return ""

async def is_sitemap_index(content: str) -> bool:
    """Check if the content is a sitemap index."""
    try:
        soup = BeautifulSoup(content, 'xml')
        return bool(soup.find('sitemapindex'))
    except Exception:
        return False

async def process_sitemap_recursive(
    session: aiohttp.ClientSession,
    sitemap_url: str,
    semaphore: Semaphore,
    metrics: CrawlMetrics,
    depth: int = 0,
    processed_urls: Set[str] = None
) -> AsyncIterator[str]:
    """Recursively process sitemaps and yield page URLs."""
    if processed_urls is None:
        processed_urls = set()
    
    if depth >= MAX_SITEMAP_DEPTH:
        logger.warning(f"Maximum sitemap depth reached for {sitemap_url}")
        return
    
    if sitemap_url in processed_urls:
        return
    
    if not should_process_sitemap(sitemap_url, metrics.filter_metrics):
        return
    
    processed_urls.add(sitemap_url)
    metrics.total_sitemaps += 1
    
    try:
        content = await fetch_url(session, sitemap_url, semaphore, metrics)
        if not content:
            return
            
        soup = BeautifulSoup(content, 'xml')
        
        if await is_sitemap_index(content):
            logger.info(f"Processing sitemap index: {sitemap_url}")
            sitemap_urls = []
            
            for sitemap in soup.find_all('sitemap'):
                loc = sitemap.find('loc')
                if loc and loc.text:
                    sitemap_urls.append(loc.text)
            
            for child_url in sitemap_urls:
                async for url in process_sitemap_recursive(
                    session,
                    child_url,
                    semaphore,
                    metrics,
                    depth + 1,
                    processed_urls
                ):
                    yield url
                    
        else:
            logger.info(f"Processing sitemap: {sitemap_url}")
            for url in soup.find_all('url'):
                loc = url.find('loc')
                if loc and loc.text:
                    yield loc.text
                    
    except Exception as e:
        logger.error(f"Error processing sitemap {sitemap_url}: {e}")
        metrics.failed_requests += 1

async def process_urls_in_batches(
    session: aiohttp.ClientSession,
    url_iterator: AsyncIterator[str],
    metrics: CrawlMetrics,
    results: CrawlResults
) -> None:
    """Process URLs in batches to manage memory usage."""
    semaphore = Semaphore(MAX_CONCURRENT_REQUESTS)
    current_batch = []
    batch_results = []
    
    async def process_url(url: str):
        if not should_process_url(url, metrics.filter_metrics):
            return None
            
        found = await extract_target_urls_from_page(session, url, semaphore, metrics)
        if found:
            # Add each found link to the results
            for target_link in found:
                results.add_result(target_link, url)
            return {url: list(found)}
        return None

    async for url in url_iterator:
        metrics.total_pages += 1
        current_batch.append(url)
        
        if len(current_batch) >= BATCH_SIZE:
            tasks = [process_url(url) for url in current_batch]
            results_batch = await asyncio.gather(*tasks)
            batch_results.extend([r for r in results_batch if r is not None])
            
            if len(batch_results) >= BATCH_SIZE:
                await results.write_batch(batch_results)
                batch_results = []
            
            current_batch = []
            await asyncio.sleep(REQUEST_DELAY)
    
    # Process remaining URLs
    if current_batch:
        tasks = [process_url(url) for url in current_batch]
        results_batch = await asyncio.gather(*tasks)
        batch_results.extend([r for r in results_batch if r is not None])
    
    if batch_results:
        await results.write_batch(batch_results)

async def extract_target_urls_from_page(session: aiohttp.ClientSession, page_url: str, semaphore: Semaphore, metrics: CrawlMetrics) -> Set[str]:
    """Visit the page and extract any links containing the keyword."""
    logger.info(f"Visiting page: {page_url}")
    found_urls = set()
    
    for attempt in range(MAX_RETRIES):
        try:
            content = await fetch_url(session, page_url, semaphore, metrics)
            if content:
                soup = BeautifulSoup(content, 'html.parser')
                for a_tag in soup.find_all('a', href=True):
                    href = a_tag['href']
                    absolute_url = urllib.parse.urljoin(page_url, href)
                    if TARGET_KEYWORD in absolute_url:
                        found_urls.add(absolute_url)
                return found_urls
                
        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                logger.error(f"Failed to fetch {page_url} after {MAX_RETRIES} attempts: {e}")
                metrics.failed_requests += 1
                return set()
            await asyncio.sleep(REQUEST_DELAY * (2 ** attempt))

async def main_async():
    sitemap_index_url = "https://www.recordedfuture.com/sitemap-index.xml"
    metrics = CrawlMetrics(start_time=datetime.now())
    results = CrawlResults()
    
    async with aiohttp.ClientSession() as session:
        try:
            # Process sitemaps and URLs in a streaming fashion
            url_iterator = process_sitemap_recursive(
                session,
                sitemap_index_url,
                Semaphore(MAX_CONCURRENT_REQUESTS),
                metrics
            )
            
            await process_urls_in_batches(session, url_iterator, metrics, results)
            
            # Finalize results and write metrics
            await results.finalize_results(metrics.output_file)
            metrics.end_time = datetime.now()
            await metrics.write_metrics(results)
            
            logger.info(f"Results have been saved to: {metrics.output_file}")

        except Exception as e:
            logger.error(f"An error occurred during execution: {e}")
            metrics.end_time = datetime.now()
            await metrics.write_metrics(results)
            raise

def main():
    asyncio.run(main_async())

if __name__ == "__main__":
    main()
