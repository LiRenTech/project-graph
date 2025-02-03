package liren.project_graph

import android.os.Build
import android.os.Bundle
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import androidx.core.view.WindowCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // 设置布局内容（确保在调用窗口相关设置之前）
    setContentView(R.layout.activity_main)

    // 全屏显示应用内容
    WindowCompat.setDecorFitsSystemWindows(window, false)

    // 隐藏系统栏 (状态栏和导航栏)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.decorView.windowInsetsController?.let { controller ->
        controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
        controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      }
    }

    // 防止在沉浸模式下屏幕变暗
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }
}
