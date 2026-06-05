import { Card, Skeleton } from 'antd'

interface ImageSkeletonProps {
  height?: number
}

export const ImageSkeleton = ({ height = 300 }: ImageSkeletonProps) => (
  <Card style={{ borderRadius: 'var(--radius-lg)' }}>
    <Skeleton.Image active style={{ width: '100%', height }} />
    <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
  </Card>
)

export const AnalysisSkeleton = () => (
  <Card title="色彩分析" style={{ borderRadius: 'var(--radius-lg)' }}>
    <Skeleton active paragraph={{ rows: 4 }} />
  </Card>
)
