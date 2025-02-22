import { CountResultObject } from "../../core/service/dataManageService/ComplexityDetector";

/**
 * 复杂度结果面板
 * @param n
 * @returns
 */
export default function ComplexityResultPanel(result: CountResultObject) {
  return (
    <div className="bg-panel-bg text-panel-text w-full shadow-lg">
      <div className="grid grid-cols-3 gap-4">
        <StatGroup title="文字统计">
          <StatItem label="总字数" value={result.wordCount} />
          <StatItem
            label="平均字数/文本节点"
            value={result.averageWordCountPreTextNode}
            tooltip="每个文本节点的平均字符数量"
          />
        </StatGroup>
        <StatGroup title="实体统计">
          <StatItem label="总实体数" value={result.entityCount} />
          <StatItem label="关联关系数" value={result.associationCount} />
          <StatItem label="区域块数" value={result.sectionCount} />
          <StatItem label="文本节点数" value={result.textNodeCount} />
        </StatGroup>
        <StatGroup title="舞台信息">
          <StatItem label="宽度" value={`${result.stageWidth.toFixed(1)}px`} />
          <StatItem label="高度" value={`${result.stageHeight.toFixed(1)}px`} />
          <StatItem label="总面积" value={`${result.stageArea.toLocaleString()}px²`} />
        </StatGroup>
        <StatGroup title="资源统计">
          <StatItem label="图片数量" value={result.imageCount} warningThreshold={100} />
          <StatItem label="链接数量" value={result.urlCount} warningThreshold={1000} />
          <StatItem label="笔迹数量" value={result.penStrokeCount} warningThreshold={0} />
          <StatItem label="连接点" value={result.connectPointCount} warningThreshold={1000} />
          <StatItem label="连接点" value={result.isolatedConnectPointCount} warningThreshold={0} />
        </StatGroup>
        <StatGroup title="图论分析">
          <StatItem label="自环数量" value={result.selfLoopCount} />
          <StatItem label="平均出度" value={result.averageEntityOutEdgeCount.toFixed(2)} />
          <StatItem label="平均入度" value={result.averageEntityInEdgeCount.toFixed(2)} />
          <StatItem label="节点团数" value={result.entityClusterCount} />
        </StatGroup>

        <StatGroup title="可视化质量">
          <StatItem label="重叠节点" value={result.entityOverlapCount} />
          <StatItem label="线条交叉数" value={result.crossCount} />
          <StatItem label="最大嵌套深度" value={result.maxDepth} />
        </StatGroup>
        <StatGroup title="其他">
          <StatItem label="节点密度" value={result.entityDensity.toFixed(4)} />
          <StatItem label="有色实体" value={result.noTransparentEntityColorCount} />
          <StatItem label="透明实体" value={result.transparentEntityColorCount} />
          <StatItem label="连接点总数" value={result.connectPointCount} />
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
  const showWarning = typeof value === "number" && warningThreshold && value > warningThreshold;
  return (
    <div className="flex items-center justify-between">
      <span className="text-panel-details-text">
        {label}
        {tooltip && <span className="text-panel-details-text ml-1 text-xs">(?)</span>}
      </span>
      <span className={`font-medium ${showWarning ? "text-panel-warning-text" : "text-panel-success-text"}`}>
        {value}
      </span>
    </div>
  );
}
