import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.css"; // Стилі для каруселі
import "./Carousel.scss";

const CarouselComponent = () => {
  return (
    <div className="carousel-section">
      <Carousel
        autoPlay
        infiniteLoop
        showIndicators={false}
        showThumbs={false}
        showArrows={false} // Вимкнути стрілки
        interval={3000} // Інтервал
        transitionTime={500} // Плавний перехід між слайдами
      >
        <div>
          <img
            src="/images/carousel/carousel-1.jpg"
            alt="1"
          />
        </div>
        <div>
          <img
            src="/images/carousel/carousel-2.jpg"
            alt="2"
          />
        </div>
        <div>
          <img
            src="/images/carousel/carousel-3.jpg"
            alt="3"
          />
        </div>
        <div>
          <img
            src="/images/carousel/carousel-4.jpg"
            alt="3"
          />
        </div>
      </Carousel>
    </div>
  );
};

export default CarouselComponent;
