import platform

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QDialog, QLabel, QLineEdit, QVBoxLayout

from project_graph.settings.setting_service import SETTING_SERVICE


def show_ai_settings():
    """打开AI设置"""
    dialog = QDialog()

    if platform.system() == "Darwin":
        dialog.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        dialog.setWindowIcon(QIcon(":/favicon.ico"))

    dialog.setWindowTitle("AI 设置")
    dialog.setMinimumWidth(500)

    # 设置布局
    layout = QVBoxLayout()

    # 提示：重启应用后生效
    restart_label = QLabel("提示：重启应用后生效")
    restart_label.setStyleSheet("color: red;")
    layout.addWidget(restart_label)

    # ark_api_key
    ark_api_key_label = QLabel("ARK API Key:")
    ark_api_key_input = QLineEdit()
    ark_api_key_input.setText(SETTING_SERVICE.ark_api_key)
    ark_api_key_input.setPlaceholderText("留空则使用默认 Key (支持模型: 豆包)")

    def ark_api_key_input_text_changed():
        SETTING_SERVICE.ark_api_key = ark_api_key_input.text()

    ark_api_key_input.textChanged.connect(ark_api_key_input_text_changed)
    layout.addWidget(ark_api_key_label)
    layout.addWidget(ark_api_key_input)

    # openai_api_key
    openai_api_key_label = QLabel("OpenAI API Key:")
    openai_api_key_input = QLineEdit()
    openai_api_key_input.setText(SETTING_SERVICE.openai_api_key)
    openai_api_key_input.setPlaceholderText(
        "留空则使用默认 Key (支持模型: gpt-4o-mini, gpt-3.5-turbo, net-gpt-3.5-turbo)"
    )

    def openai_api_key_input_text_changed():
        SETTING_SERVICE.openai_api_key = openai_api_key_input.text()

    openai_api_key_input.textChanged.connect(openai_api_key_input_text_changed)
    layout.addWidget(openai_api_key_label)
    layout.addWidget(openai_api_key_input)

    # openai_api_base
    openai_api_base_label = QLabel("OpenAI API Base URL:")
    openai_api_base_input = QLineEdit()
    openai_api_base_input.setText(SETTING_SERVICE.openai_api_base)
    openai_api_base_input.setPlaceholderText(
        "留空则使用默认 Base URL (https://free.gpt.ge/v1)"
    )

    def openai_api_base_input_text_changed():
        SETTING_SERVICE.openai_api_base = openai_api_base_input.text()

    openai_api_base_input.textChanged.connect(openai_api_base_input_text_changed)
    layout.addWidget(openai_api_base_label)
    layout.addWidget(openai_api_base_input)

    # 设置布局到对话框
    dialog.setLayout(layout)
    dialog.exec_()
    pass
