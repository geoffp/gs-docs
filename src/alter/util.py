import re
from bs4 import BeautifulSoup, NavigableString

html = BeautifulSoup('', 'html.parser')


def template(string):
    return BeautifulSoup(string, 'html.parser')


def make_new(tag_name, parent=None, contents=None, attrs={}):
    new = html.new_tag(tag_name, attrs=attrs)
    if parent is not None:
        parent.append(new)
    if contents is not None:
        new.string = contents
    return new


def killall(elements):
    [e.decompose() for e in elements]


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


def listify(val):
    """
    If passed a single value, return a list with just that in it.
    If passed a list, return that list.
    """
    if type(val) is list:
        return val
    return [val]


def is_under(tag_names, string_node):
    tag_names = listify(tag_names)
    ancestry = [ancestor.name for ancestor in string_node.parents]

    for t in tag_names:
        if t in ancestry:
            return True

    return False


def wrap_with_tag(s, tag_name, class_name=None):
    """
    Wrap the section number (the original contents of each link)
    with a <span> or other tag for styling, optionally with a class
    name.
    """
    attrs = {'class': class_name} if class_name else {}
    wrapper = html.new_tag(tag_name, attrs=attrs)
    return s.wrap(wrapper)


def string_children_of(node):
    """
    Return a list of children that are NavigableStrings.
    """
    return [c for c in node.children if is_string(c)]


# Nav-specific

def indent_nav_item(li):
    """
    Count the dots in the number and indent the nav item no more than
    one level.
    """
    dots = min(li.a.string.count('.'), 1)
    li['class'] = 'lvl-%d' % dots


def move_section_name_into_a(li):
    [li.a.append(wrap_with_tag(section_name, 'span', 'section-name'))
     for section_name in string_children_of(li)]


def wrap_section_number(li):
    return wrap_with_tag(li.a.string, 'span', 'section-number')


def replace_string_node(string_node, new_nodes):
    string_node.insert_after(*new_nodes)
    string_node.replace_with('')


def ul_to_dl(ul, class_name):
    ul.name = 'dl'
    ul['class'] = class_name
    for li in ul('li'):
        term, definition = [side.strip() for side in li.string.split('=')]
        dt = make_new('dt', contents=term)
        dd = make_new('dd', contents=definition)
        li.insert_after(dt, dd)
        li.decompose()


class CPUFeature:
    long_name = ""
    short_name = ""

    def __init__(self, text):
        self.text = text
        self.parse_long_name()
        self.parse_short_name()

    def parse_long_name(self):
        self.long_name = self.match().group(1)

    def parse_short_name(self):
        letters = re.compile(r'[A-Z]', re.MULTILINE).findall(self.long_name)
        self.short_name = "".join(letters)

    def match(self):
        return re.compile(self.matcher()).match(self.text)

    def matcher(self):
        return r'The (.*) flag'

    def printable_fields(self):
        return [self.short_name, self.long_name]

    def __repr__(self):
        return f'{type(self).__name__}({",".join(self.printable_fields())})'


class Flag(CPUFeature):
    bit = None                  # We parse this out later

    def matcher(self):
        return r'The (.*) flag'


class Register(CPUFeature):
    width = 0

    def __init__(self, text):
        super().__init__(text)
        self.parse_width()

    def matcher(self):
        return r'^The (.*)\s+\((\d+) bits wide\)'

    def parse_width(self):
        self.width = self.match().group(2)

    def printable_fields(self):
        return super().printable_fields() + [self.width]


class FlagRegisterBit(CPUFeature):
    def matcher(self):
        return r'P register bit (\d): (.*)'

    def parse_short_name(self):
        self.short_name = self.match().group(1)

    def parse_long_name(self):
        self.long_name = self.match().group(2)


def find_adjacent_ul(html, signifier):
    expo = html.find(string=re.compile(signifier))
    possibleUlLocations = [
        expo.parent.find_next_sibling("ul"),
        expo.find_next_sibling("ul")
    ]
    found_ul = next(ul for ul in possibleUlLocations if ul is not None)
    return found_ul
