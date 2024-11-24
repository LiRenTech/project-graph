// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 测试发现可以给run函数增加一些自定义的参数。
    // 当时是想传一个时间戳来测试时间，但想想好像没必要 ——littlefean
    project_graph_lib::run()
}
