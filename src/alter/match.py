import re

call_expression = re.compile(r'\b[A-Z]{3}\s*[([]?\s*#?\$[0-9A-Fa-f]+(\s*,\s*[SsXYxy])?\s*[)\]]?\s*(\s*,\s*[XYxy])?', re.MULTILINE)
hex_number = re.compile(r'#?\$[0-9A-Fa-f]+')
opcode = re.compile(r'\b[A-Z]{3}\b')


def is_opcode_heading(s):
    matcher = re.compile(r'^\s*[\d.]*\s*\b[A-Z]{3}\b')
    return matcher.match(s)


def is_address(s):
    matcher = re.compile(r'\+(?=-+|$)', re.DOTALL | re.MULTILINE)
    return matcher.search(s)


def is_op_table(text):
    lines = text.splitlines()
    matcher = re.compile(r'^[- ]+$')
    if len(lines) > 2:
        dash_line = lines[2]  # this is brittle, but works for now
        return matcher.match(dash_line)
    return False
