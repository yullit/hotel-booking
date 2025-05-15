import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.css"; // Стилі для каруселі
import './Carousel.scss';

const CarouselComponent = () => {
  return (
    <div className="carousel-section">
      <Carousel
        autoPlay // Автоматичний рух каруселі
        infiniteLoop // Безкінечний цикл
        showIndicators={false} // Приховати індикатори
        showThumbs={false} // Приховати мініатюри
        showArrows={true} // Показати стрілки зліва і справа
        interval={3000} // Інтервал між слайдами (3 секунди)
        transitionTime={500} // Час переходу між слайдами (500 мс)
      >
        <div>
          <img src="/images/apartment-classic/apartment-classic-1.png" alt="1" />
          <p className="legend"></p>
        </div>
        <div>
          <img src="/images/apartment-classic/apartment-classic-1.png" alt="2" />
          <p className="legend"></p>
        </div>
        <div>
          <img src="/images/apartment-classic/apartment-classic-1.png" alt="3" />
          <p className="legend"></p>
        </div>
      </Carousel>
    </div>
  );
};

export default CarouselComponent;
