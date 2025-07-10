# Page Crawler

A Python script for crawling web pages and extracting specific links.

## Setup

### Virtual Environment

It's recommended to use a virtual environment to isolate the project dependencies:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

To deactivate the virtual environment when you're done:

```bash
deactivate
```

## Dependencies

Install the required packages:

```bash
pip install requests beautifulsoup4 aiohttp aiofiles lxml
```

Required packages:

- `requests`: For making HTTP requests
- `beautifulsoup4`: For parsing HTML and XML
- `aiohttp`: For asynchronous HTTP requests
- `aiofiles`: For asynchronous file operations
- `lxml`: For XML parsing (required by BeautifulSoup)

## Usage

Run the script:

```bash
python page-crawler.py
```

The script will:

1. Start from the sitemap index
2. Recursively process all sitemaps
3. Visit each page and extract target links
4. Save results to a timestamped output file

## Output

Results are saved in a text file with the format: `crawl_results_YYYYMMDD_HHMMSS.txt`

The output includes:

- All found target links and their source pages
- Performance metrics
- Filter statistics
