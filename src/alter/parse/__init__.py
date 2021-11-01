from collections import namedtuple
from . import parse_op_table


Addy = namedtuple('Addy', 'bytes description')
AddyByte = namedtuple('AddyBytes', 'text length')


def op_table(text):
    return parse_op_table.table(text)


def get_byte_length(part):
    chars = len(part)

    if (chars > 30):
        return 3
    elif (chars > 15):
        return 2
    else:
        return 1


def address(s):
    lines = s.splitlines()

    # Find the first line that starts with "!", and break it up
    _, *address_bytes, description = next(
        line for line in lines if line.startswith('!')
    ).split('!')

    # Return a nice structure of named tuples
    return Addy(
        [AddyByte(b.strip(), get_byte_length(b)) for b in address_bytes],
        description.strip(),
    )
