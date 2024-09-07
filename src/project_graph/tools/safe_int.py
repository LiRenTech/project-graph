"""
超级放大的时候出现一个极大矩形，导致程序崩溃，所以需要一个安全的整数转换函数。

"""


def safe_int(value):
    """value must be in the range -2147483648 to 2147483647"""
    try:
        if value < -2147483648 or value > 2147483647:
            return 2147483647 if value > 2147483647 else -2147483648
        else:
            return int(value)
    except OverflowError:
        return 2147483647
