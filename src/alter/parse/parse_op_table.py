# OP LEN CYCLES      MODE      nvmxdizc e SYNTAX
# -- --- ----------- --------- ---------- ------
# 3A 1   2           acc       m.....m. . DEC
# C6 2   7-2*m+w     dir       m.....m. . DEC $10
# CE 3   8-2*m       abs       m.....m. . DEC $9876
# D6 2   8-2*m+w     dir,X     m.....m. . DEC $10,X
# DE 3   9-2*m       abs,X     m.....m. . DEC $9876,X
# CA 1   2           imp       x.....x. . DEX
# 88 1   2           imp       x.....x. . DEY
# 1A 1   2           acc       m.....m. . INC
# E6 2   7-2*m+w     dir       m.....m. . INC $10
# EE 3   8-2*m       abs       m.....m. . INC $9876
# F6 2   8-2*m+w     dir,X     m.....m. . INC $10,X
# FE 3   9-2*m       abs,X     m.....m. . INC $9876,X
# E8 1   2           imp       x.....x. . INX
# C8 1   2           imp       x.....x. . INY


def headers(header_line, field_lengths):
    headers = []
    start = 0
    for f in field_lengths:
        end = start + f
        headers.append(header_line[start:end].strip())
        start = end + 1
    return headers


def rows(lines, field_lengths):
    rows = []
    for line in lines[3:]:
        # Start grabbing segments according to field lengths
        fields = []
        start = 0
        for idx, f in enumerate(field_lengths):
            end = start + f
            # For the last one, just grab the rest;
            # Sometimes that value is wider than the dashes
            is_last = idx == (len(field_lengths) - 1)
            value = line[start:] if is_last else line[start:end]
            fields.append(value.strip())
            start = end + 1
        rows.append(fields)
    return rows


def table(text):
    lines = text.splitlines()
    header_line = lines[1]
    dash_line = lines[2]  # as noted earlier, this is brittle

    # Just field lengths for now
    field_lengths = [len(dashes) for dashes in dash_line.split(' ')]

    # Parse out headers and rows
    return headers(header_line, field_lengths), rows(lines, field_lengths)
