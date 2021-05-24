import json, os, re, itertools
import pandas as pd
import urllib.request
from bs4 import BeautifulSoup
from urllib.request import Request, urlopen, urlparse

with open("backend/config.json", "r") as f:
    config = json.load(f)

EXCEL_DIR = config.get("EXCEL_DIR") 
CHROME_DRIVER = config.get("CHROME_DRIVER")
CSV_EXTENSION = ".csv"

def get_filename(url):
    if url.count(':') <= 1:
        return re.findall(r'w*\.*([a-zA-Z0-9]+)\.', urlparse(url).netloc)[0]
    else:
        return re.findall(r'w*\.*([a-zA-Z0-9]+)\:', urlparse(url).netloc)[0]

def get_page_title(url):
    try:
        url = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(urlopen(url), features="html.parser")
        return soup.title.get_text()
    except Exception as e:
        print(f"Error: {e}")
        return 'Unnamed'

def crawl_url(url):
    print(f'Crawling: {url}')
    url_ = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(urlopen(url_), "html.parser")
    pages, titles = [url], [get_page_title(url)]
    for link in soup.findAll('a'):
        page = link.get('href')
        page = url + page if page.count('/') == 1 else page
        if (urlparse(url).netloc == urlparse(page).netloc) and (page not in pages):
            print(f'Found: {page}') 
            pages.append(page)
            titles.append(get_page_title(page))
    df = pd.DataFrame()
    df['title'] = titles
    df['url'] = pages 
    save_path = os.path.join(EXCEL_DIR, get_filename(url) + CSV_EXTENSION)
    df.to_csv(save_path, index=False)
    return titles, pages

if __name__ == "__main__":
    url = "https://google.com"
    titles, pages = crawl_url(url)
    print(data)