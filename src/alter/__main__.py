from bs4 import BeautifulSoup, NavigableString
from util import (killall, kill_whitespace_in, kill_classes,
                  is_string, is_spacing_p, is_under)
import match
import build


# Read HTML file
with open("index.html") as f:
    html = BeautifulSoup(f, 'html.parser')


# Modify HTML

_, nav1, _, title_author, _, nav2, _, hr, _, br, thanks = \
    html.body.contents[0:11]


# Create header
def make_header():
    killall([nav1, nav2, hr, br])
    title_author.name = 'header'
    title, author = title_author.findAll('span')
    title.name = 'h1'
    author.name = 'address'
    kill_classes([title, author])
    kill_whitespace_in(title_author)
    aside = html.new_tag('aside', attrs={'class': 'right'})
    thanks.wrap(aside)


# Add things to <head> (css, js)
def process_head():
    head = html.head
    to_prepend = [html.new_tag('base', href="/src/65c816/")]
    to_append = [
        html.new_tag('meta', attrs={
            'name': 'viewport',
            'content': "width=device-width, initial-scale=1"
        }),
        html.new_tag('link', rel="stylesheet", href="./index.css"),
        html.new_tag('script', type="module", src="./index.js"),
    ]
    [head.contents[0].insert_before(e) for e in to_prepend]
    [head.append(e) for e in to_append]


# Add the search bar
def make_search():
    search_bar = html.new_tag('search-bar')
    title_author.insert_after(search_bar)


# Wrap sections
def wrap_sections():
    section = None
    e = html.body.h3  # first h3
    while e:
        next = e.next_sibling
        if e.name == 'h3':
            section = e.wrap(html.new_tag('section'))
        elif is_spacing_p(e):
            e.decompose()
        else:
            section.append(e)
        e = next


def wrap_bare_text_in_sections():
    for section in html.body.find_all('section'):
        for child in section.children:
            if type(child) is NavigableString and child.strip() != '':
                p = html.new_tag('p', attrs={'class': 'added'})
                child.wrap(p)


def process_nav():
    nav = html.body.section
    nav.name = 'nav'

    for li in nav.select('ul > li'):
        dots = min(li.a.string.count('.'), 1)
        li['class'] = 'lvl-%d' % dots
        num_span = html.new_tag('span', attrs={'class': 'section-number'})
        li.a.string.wrap(num_span)
        for s in li.children:
            if type(s) is NavigableString:
                title_span = html.new_tag('span', attrs={'class': 'section-name'})
                li.a.append(s)
                s.wrap(title_span)


# Recapitalize nav and section headings
def process_headings():
    lis = html.select("ul > li, h3 > a")
    for li in lis:
        for c in li.children:
            if is_string(c) and not match.is_opcode_heading(c):
                c.replace_with(c.title().replace('And', 'and'))


def process_preformatteds():
    pres = html.findAll('pre')

    for pre in pres:
        pre_text = pre.get_text()

        if match.is_address(pre_text):
            pre.replace_with(build.address(pre_text))

        elif match.is_op_table(pre_text):
            pre.replace_with(build.op_table(pre_text))


def contains_match(result):
    return len(result) > 1


def process_matches_in_string_node(haystack, needle):
    # The resulting list of nodes
    output = []

    # Each match, we push the preceding text into the result,
    # along with the wrapped match. We then continue to loop,
    # but narrow the searched content to the unprocessed portion
    # of the original string -- the slice after the match.
    while haystack:
        # Search for one match at a time
        result = match_in_string_node(haystack, needle)
        if contains_match(result):
            before_string, wrapped, after_match = result
            output.extend([before_string, wrapped])
            haystack = after_match
        else:
            output.extend(result)
            haystack = None

    return output


def match_in_string_node(haystack, needle):
    m = needle.search(haystack)
    if m:
        before_string = NavigableString(haystack[:m.start()])
        after_string = NavigableString(haystack[m.end():])

        thing = m.group()
        wrapped = html.new_tag('code')
        wrapped.string = thing

        return [before_string, wrapped, after_string]

    return [haystack]


def wrap_patterns(matcher, filter_func=lambda _: True):
    # ps = html.find_all(lambda e: True, string=match.hex_string)
    ps = html.find_all(string=matcher)
    for string_node in filter(filter_func, ps):
        new_nodes = process_matches_in_string_node(
            string_node, matcher
        )
        string_node.insert_after(*new_nodes)
        string_node.replace_with('')


# Do the things!
process_head()
make_header()
make_search()
wrap_sections()
wrap_bare_text_in_sections()
process_headings()
process_preformatteds()
process_nav()
wrap_patterns(
    match.call_expression,
    lambda s: is_under(['p', 'li'], s) and not is_under('code', s)
)
wrap_patterns(
    match.hex_number,
    lambda s: is_under(['p', 'li'], s) and not is_under('code', s)
)
wrap_patterns(
    match.opcode,
    lambda s: not is_under(['code', 'pre', 'table'], s)
)

# Write HTML
with open("index.html", 'w') as f:
    f.write(str(html))