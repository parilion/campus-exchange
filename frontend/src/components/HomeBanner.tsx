import { Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import './HomeBanner.css';

export interface BannerItem {
  image: string;
  title: string;
  description: string;
  link?: string;
}

interface HomeBannerProps {
  banners: BannerItem[];
  height?: number;
  autoplay?: boolean;
}

/**
 * 可复用首页轮播图/Banner 组件
 */
const HomeBanner = ({ banners, height = 360, autoplay = true }: HomeBannerProps) => {
  const navigate = useNavigate();

  const handleClick = (link?: string) => {
    if (link) navigate(link);
  };

  return (
    <div className="hb-wrapper">
      <Carousel autoplay={autoplay} dots={{ className: 'hb-dots' }} effect="fade">
        {banners.map((banner, index) => (
          <div key={index}>
            <div
              className="hb-slide"
              style={{ height, cursor: banner.link ? 'pointer' : 'default' }}
              onClick={() => handleClick(banner.link)}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="hb-image"
              />
              <div className="hb-overlay">
                <div className="hb-content">
                  <h2 className="hb-title">{banner.title}</h2>
                  <p className="hb-desc">{banner.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default HomeBanner;
