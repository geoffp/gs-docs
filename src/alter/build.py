from copy import copy
from bs4 import BeautifulSoup
import parse
from util import make_new
from os.path import join, dirname


# Read templates HTML file
with open(join(dirname(__file__), "templates.html")) as file:
    templates = BeautifulSoup(file, 'html.parser')


def find_first(name, el):
    return el.findAll(name)[0]


def address_bytes(abytes, address_el):
    container = find_first('address-bytes', address_el)
    for byte in abytes:
        text, length = byte
        make_new('address-byte', container, text, {'length': length})


def address_description(data, address_el):
    el = find_first('address-description', address_el)
    el.string = data


def address(text):
    abytes, description = parse.address(text)
    el = copy(templates.address)

    address_bytes(abytes, el)
    address_description(description, el)

    return el


def op_table(text):
    headers, rows = parse.op_table(text)
    t = copy(templates.table)

    def make_body_tr(row):
        tr = make_new('tr', t.tbody)
        [make_new('td', tr, field) for field in row]

    [make_new('th', t.thead.tr, h) for h in headers]
    [make_body_tr(r) for r in rows]

    return t
