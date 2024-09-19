import datetime

logs: list[str] = []


def log(*args):
    global logs
    msg = (
        "["
        + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        + "] "
        + " ".join(str(a) for a in args)
    )
    logs.append(msg)
    print(msg)
