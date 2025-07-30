import { isNumber } from "lodash";
import { CountResultObject } from "@/core/service/dataManageService/ComplexityDetector";
import { cn } from "@/utils/cn";

/**
 * 复杂度结果面板
 * @param n
 * @returns
 */
export default function ComplexityResultPanel(result: CountResultObject) {
  return (
    <div className="bg-panel-bg text-panel-text w-full shadow-lg">
      <div className="grid grid-cols-3 gap-4">
        <StatGroup title="实体统计">
          <StatItem label="总实体数" value={result.entityCount} />
          <StatItem label="Section框数量" value={result.sectionCount} />
          <StatItem label="文本节点数" value={result.textNodeCount} />
          <StatItem label="连接点总数" value={result.connectPointCount} />
          <StatItem label="URL链接数量" value={result.urlCount} warningThreshold={1000} />
          <StatItem label="涂鸦数量" value={result.penStrokeCount} warningThreshold={0} />
          <StatItem label="质点数量" value={result.connectPointCount} warningThreshold={1000} />
          <StatItem label="图片节点数量" value={result.imageCount} warningThreshold={100} />
        </StatGroup>
        <StatGroup title="图论分析">
          <StatItem label="连线数量" value={result.associationCount} />
          <StatItem label="自环数量" value={result.selfLoopCount} />
          <StatItem label="孤立节点数量" value={result.isolatedConnectableEntityCount} />
          <StatItem label="多重边数量" value={result.multiEdgeCount} warningThreshold={0} />
        </StatGroup>

        <StatGroup title="集合论分析">
          <StatItem label="最大嵌套深度" value={result.maxSectionDepth} />
          <StatItem label="交集中的元素数量" value={result.crossEntityCount} warningThreshold={0} />
          <StatItem label="空集数量" value={result.emptySetCount} warningThreshold={0} />
        </StatGroup>
        <StatGroup title="笔记化统计">
          <StatItem label="文本节点总字数" value={result.textNodeWordCount} />
          <StatItem label="每个文本节点的平均字符数量" value={result.averageWordCountPreTextNode} />
          <StatItem label="连线上的字数" value={result.associationWordCount} />
          <StatItem label="实体详情总字数" value={result.entityDetailsWordCount} />
        </StatGroup>

        <StatGroup title="可视化质量">
          <StatItem label="平均每百像素块节点密度" value={result.entityDensity.toFixed(4)} warningThreshold={1} />
          <StatItem label="重叠节点" value={result.entityOverlapCount} warningThreshold={1} />
          <StatItem label="独立质点数量" value={result.isolatedConnectPointCount} warningThreshold={0} />
          <StatItem label="全部内容外接矩形宽度" value={`${result.stageWidth.toFixed(0)}px`} />
          <StatItem label="全部内容外接矩形高度" value={`${result.stageHeight.toFixed(0)}px`} />
          <StatItem label="全部内容外接矩形总面积" value={`${result.stageArea.toFixed(0)}px²`} />
        </StatGroup>

        <StatGroup title="色彩分析">
          <StatItem label="着色实体" value={result.noTransparentEntityColorCount} />
          <StatItem label="未着色实体" value={result.transparentEntityColorCount} />
          <StatItem label="实体颜色种类数量" value={result.entityColorTypeCount} />
          <StatItem label="着色关系" value={result.noTransparentEdgeColorCount} />
          <StatItem label="未着色关系" value={result.transparentEdgeColorCount} />
          <StatItem label="关系颜色种类数量" value={result.edgeColorTypeCount} />
        </StatGroup>
      </div>
    </div>
  );
}

// 辅助组件
function StatGroup({ title, children, tooltip }: { title: string; children: React.ReactNode; tooltip?: string }) {
  return (
    <div className="rounded-md p-2">
      <div className="mb-3 flex items-center gap-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {tooltip && <span className="text-sm">(?)</span>}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function StatItem({
  label,
  value,
  tooltip,
  warningThreshold,
}: {
  label: string;
  value: number | string;
  tooltip?: string;
  warningThreshold?: number;
}) {
  let showWarning = false;
  if (isNumber(value) && isNumber(warningThreshold)) {
    if (value > warningThreshold) {
      showWarning = true;
    }
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-panel-details-text">
        {label}
        {tooltip && <span className="text-panel-details-text ml-1 text-xs">(?)</span>}
      </span>
      <span className={cn(showWarning ? "text-panel-warning-text" : "text-panel-success-text")}>{value}</span>
    </div>
  );
}
