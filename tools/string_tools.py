def get_width_by_file_name(file_name: str) -> int:
    """
    根据文件名获取宽度
    :param file_name:
    :return:
    """
    res = 0
    for c in file_name:
        if "\u4e00" <= c <= "\u9fff":
            res += 53.33333333333333
        else:
            res += 33.33333333333333
    return int(res)
