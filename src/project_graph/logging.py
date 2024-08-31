logs: list[str] = []


def log(*args):
    global logs
    msg = " ".join(str(a) for a in args)
    logs.append(msg)
    print(msg, logs)
