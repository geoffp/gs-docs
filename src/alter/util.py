import re
from bs4 import BeautifulSoup, NavigableString

html = BeautifulSoup('', 'html.parser')


def template(string):
    return BeautifulSoup(string, 'html.parser')


def make_new(tag_name, parent, contents=None, attrs={}):
    new = html.new_tag(tag_name, attrs=attrs)
    parent.append(new)
    if contents is not None:
        new.string = contents
    return new


def killall(elements):
    for e in elements:
        e.decompose()


def kill_whitespace_in(element):
    for s in element(string=re.compile("^\\s+$")):
        s.replace_with('')


def kill_classes(elements):
    for e in elements:
        del e['class']


def is_string(e):
    return isinstance(e, NavigableString)


def is_spacing_p(e):
    return not is_string(e) and (
        len(e.contents) == 1 and e.name == 'p' and e.br
    )


def is_under(tag_names, string_node):
    if (type(tag_names) is not list):
        tag_names = [tag_names]

    ancestry = [ancestor.name for ancestor in string_node.parents]

    for t in tag_names:
        if t in ancestry:
            return True

    return False
