import json, os, re, time
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from datetime import date
from typing import List, Dict, Tuple, Optional
from urllib.request import urlopen, urlparse
from selenium.webdriver.chrome.options import Options

options = Options()
options.headless = True 

with open('backend/config.json', 'r') as f:
    config = json.load(f)

EXCEL_DIR = config.get('EXCEL_DIR') 
CHROME_DRIVER = webdriver.Chrome(executable_path=config.get('CHROME_DRIVER'), options=options)
CSV_EXTENSION = '.csv'

def timeit(func):
    """Wraps a given function and logs its execution time to the console."""
    name = func.__name__.title()
    def wrap_func(*args, **kwargs):
        n_job = [arg for arg in args if isinstance(arg, int)][0]
        t1 = time.time()
        result = func(*args, **kwargs)
        t2 = time.time()
        print(f'{name} executed in process - {n_job} in {(t2-t1):.4f}s')
        return result
    return wrap_func

def convert_to_float(string): 
    try: 
        float(string)
        return float
    except ValueError:
        return str

def get_filename(url: str) -> str:
    '''[summary]

    Args:
        url (str): [description]

    Returns:
        str: [description]
    '''
    url = 'http://' + url if 'http' not in url else url
    if url.count(':') <= 1:
        return re.findall(r'w*\.*([a-zA-Z0-9]+)\.', urlparse(url).netloc)[0]
    else:
        return re.findall(r'w*\.*([a-zA-Z0-9]+)\:', urlparse(url).netloc)[0]

def get_page_title(url: str) -> str:
    '''[summary]

    Args:
        url (str): [description]

    Returns:
        str: [description]
    '''
    try:
        CHROME_DRIVER.get(url)
        html = CHROME_DRIVER.page_source.encode('utf-8')
        soup = BeautifulSoup(html, features='html.parser')
        return soup.title.get_text()
    except Exception as e:
        print(f'Error: {e}')
        return 'Unnamed'

def crawl(url: str) -> Tuple[List[str], List[str]]:
    '''[summary]

    Args:
        url (str): [description]

    Returns:
        Tuple[List[str], List[str]]: [description]
    '''
    url = url[:-1] if url[-1] == '/' else url
    CHROME_DRIVER.get(url)
    html = CHROME_DRIVER.page_source.encode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    pages, titles = [url], [get_page_title(url)]
    for link in soup.findAll('a'):
        page = link.get('href')
        page = url + page if page.count('/') == 1 else page
        if (urlparse(url).netloc == urlparse(page).netloc) and (page not in pages) and (page[:-1] not in pages):
            print(f'Found: {page}') 
            pages.append(page)
            titles.append(get_page_title(page))
    df = pd.DataFrame()
    df['title'] = titles
    df['url'] = pages 
    save_path = os.path.join(EXCEL_DIR, get_filename(url) + CSV_EXTENSION)
    df.to_csv(save_path, index=False)
    return titles, pages

def calculate_age(born: date) -> int:
    '''[summary]

    Args:
        born (date): [description]

    Returns:
        int: [description]
    '''
    if not born:
        return 0
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

def get_attribute_names(dict_: Dict, attributes_list: List[str]) -> Dict:
    '''[summary]

    Args:
        dict_ (Dict[Dict]): [description]
        attributes_list (List[str]): [description]

    Returns:
        Dict: [description]
    '''
    for attributes in attributes_list:
        if attributes in dict_:
            dict_[attributes] = [attribute['name'] for attribute in dict_[attributes] if 'name' in attribute] 
    return dict_


def create_tree(data: Dict, page_titles: List) -> List:
    '''[summary]

    Args:
        data (Dict): [description]
        page_titles (List): [description]

    Returns:
        List: [description]
    '''
    data = [str(x)[:-1] if x[-1] == '/' else x for x in data]
    result = []
    while len(data) > 0:
        d = data[0]
        t = page_titles[0]
        form_dict = {}
        l = d.split('/')
        parent = '/'.join(l[:-1])
        data.pop(0)
        page_titles.pop(0)
        form_dict['children'] = list()
        form_dict['url'] = d
        form_dict['name'] = t
        option = find_match(parent, result)
        if (option):
            option['children'].append(form_dict)
        else:
            result.append(form_dict)
    return prune_children(result[0])

def find_match(d: str, res: List[Dict]) -> Optional[Dict]:
    '''[summary]

    Args:
        d (str): [description]
        res (Dict[Dict]): [description]

    Returns:
        Optional[None, Dict]: [description]
    '''
    for t in res:
        if d == t['url']:
            return t
        elif (len(t['children']) > 0):
            temp = find_match(d, t['children'])
            if (temp):
                return temp
    return None

def prune_children(data: Dict) -> Dict:
    '''[summary]

    Args:
        data (Dict[Dict]): [description]

    Returns:
        Dict[Dict]: [description]
    '''
    if not len(data['children']):
        data.pop('children')
    else:
        for d in data['children']:
            prune_children(d)
    return data

def get_crawled_urls(domain: str) -> Dict:
    '''[summary]

    Args:
        domain (str): [description]

    Returns:
        Dict[Dict]: [description]
    '''
    xl_name = os.path.join(EXCEL_DIR, get_filename(domain) + CSV_EXTENSION)
    df = pd.read_csv(xl_name)
    data = df['url'].tolist()
    page_titles = df['title'].tolist()
    return create_tree(data, page_titles)