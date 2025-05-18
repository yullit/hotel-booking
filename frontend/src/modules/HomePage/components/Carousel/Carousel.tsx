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
            src="/images/apartment-classic/apartment-classic-1.png"
            alt="1"
          />
          <p className="legend"></p>
        </div>
        <div>
          <img
            src="/images/apartment-classic/apartment-classic-1.png"
            alt="2"
          />
          <p className="legend"></p>
        </div>
        <div>
          <img
            src="/images/apartment-classic/apartment-classic-1.png"
            alt="3"
          />
          <p className="legend"></p>
        </div>
      </Carousel>
    </div>
  );
};

export default CarouselComponent;
