import { useState, useRef, useEffect, CSSProperties } from 'react';
import { Image } from 'antd';

interface LazyImageProps {
  src: string;
  alt: string;
  fallback?: string;
  preview?: boolean;
  style?: CSSProperties;
  className?: string;
  /** 距视口底部多少 px 开始加载，默认 100 */
  rootMargin?: string;
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3C/svg%3E";

/**
 * 懒加载图片组件：进入视口时才加载真实图片，减少初始网络请求
 */
const LazyImage = ({
  src,
  alt,
  fallback,
  preview = false,
  style,
  className,
  rootMargin = '100px',
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} style={{ position: 'relative', ...style }}>
      {/* 加载占位 */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'li-shimmer 1.5s infinite',
          }}
        />
      )}
      <style>{`
        @keyframes li-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {inView && (
        <Image
          src={src}
          alt={alt}
          fallback={fallback || PLACEHOLDER}
          preview={preview}
          placeholder={<img src={PLACEHOLDER} alt="" style={style} />}
          style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      )}
    </div>
  );
};

export default LazyImage;
