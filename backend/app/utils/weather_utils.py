import pycountry
import re
import unicodedata

def get_country_code(country_name: str) -> str:
    if not country_name:
        return None
    try:
        country = pycountry.countries.search_fuzzy(country_name)[0]
        return country.alpha_2.lower()
    except (IndexError, AttributeError):
        return None


def fix_encoding(text: str) -> str | None:
    if not text:
        return None
    try:
        return text.encode('latin1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text


def clean_text(text: str | None = None) -> str | None:
    if not text:
        return None
    text = text.replace("\ufffd", "")
    text = unicodedata.normalize("NFKC", text)
    text = "".join(ch for ch in text if unicodedata.category(ch)[0] != "C")
    return re.sub(r"\s+", " ", text).strip()