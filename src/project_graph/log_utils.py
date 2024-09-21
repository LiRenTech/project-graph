import datetime
from time import perf_counter
from tracemalloc import start

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

start_time = perf_counter()
last_time = perf_counter()


def log_dur(*args):
    global last_time

    current_time = perf_counter()
    duration = current_time - last_time
    until_time = current_time - start_time
    log(f"until:{until_time:.6f}s dur: {duration:.6f}s", *args)
    last_time = current_time