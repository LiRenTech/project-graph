import tkinter as tk


class LoadingWindow:
    def __init__(self, master):
        self.master = master
        self.master.overrideredirect(True)  # 去掉标题栏
        self.master.attributes("-alpha", 0.7)  # 设置半透明效果
        self.master.title("加载中")
        # 设置整个窗口背景颜色为黑色
        master.config(bg="black")

        # 设置窗口大小和位置
        # width = 300
        # height = 200

        screen_width = master.winfo_screenwidth()
        screen_height = master.winfo_screenheight()
        # x = (screen_width // 2) - (width // 2)
        # y = (screen_height // 2) - (height // 2)
        master.geometry(f"{screen_width}x{screen_height}")  # 设置为指定宽高并居中

        # 创建内容标签
        label = tk.Label(
            master,
            text="project-graph 加载中...\n窗口出现请移动鼠标",
            font=("Times New Roman", 30),
            bg="black",  # 窗口背景颜色
            fg="#9CDCFE",  # 字体颜色（156, 220, 254）
        )
        label.pack(expand=True)  # 标签自适应大小，居中显示

    def close(self):
        self.master.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    loading_window = LoadingWindow(root)
    root.mainloop()
