from typing import Literal


class INFO:
    commit: str = ""
    date: str = ""
    branch: str = ""
    env: Literal["dev"] | Literal["prod"] = "dev"
