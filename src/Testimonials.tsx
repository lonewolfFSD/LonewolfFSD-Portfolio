import React from 'react';
import { Tilt } from 'react-tilt';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  handle: string;
  testimonial: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Startup Founder",
    handle: "@aaravsh",
    testimonial:
      "LonewolfFSD helped launch our MVP fast. Clean code, great support, and hassle-free hosting!",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Aarav",
  },
  {
    id: 2,
    name: "Meera Patel",
    role: "UI/UX Designer",
    handle: "@meeradesigns",
    testimonial:
      "Smooth domain setup and backend delivery. LonewolfFSD made it effortless.",
    rating: 4,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Meera",
  },
  {
    id: 3,
    name: "Ravi Khanna",
    role: "Digital Marketer",
    handle: "@ravik",
    testimonial:
      "Zero downtime, regular updates, and reliable support. Highly dependable service.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Ravi",
  },
  {
    id: 4,
    name: "Nisha Iyer",
    role: "Content Strategist",
    handle: "@nishaiyer",
    testimonial:
      "They managed our domain, email, and server fixes with total ease. Very professional.",
    rating: 4,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Nisha",
  },
  {
    id: 5,
    name: "Devansh Rao",
    role: "Founder, CodeNest",
    handle: "@devrao",
    testimonial:
      "LonewolfFSD nailed our platform build. Fast dev cycles, clean results.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Devansh",
  },
];



const Testimonials: React.FC = () => {
const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rating;
    return (
      <svg
        key={index}
        className={`w-5 h-5 transition-colors duration-300 ${
          isFilled
            ? "text-black group-hover:text-white"
            : "text-gray-300 group-hover:text-gray-500"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.539 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.31 9.397c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.97z" />
      </svg>
    );
  });
};


  return (
    <div>
      {/* Top Marquee - Moves Left */}
      <div className="relative overflow-hidden py-2">
  <div className="flex mobile-animate-marquee-left md:animate-marquee-left hover:animate-marquee-left-slow">
    {[...testimonials, ...testimonials].map((testimonial, index) => (
  <Tilt
    key={`${testimonial.id}-${index}`} // <- Move key here
    options={{
      scale: 1.02,
      speed: 300,
      perspective: 1000,
      glare: true,
      "max-glare": 0.2,
    }}
    style={{ transformStyle: "preserve-3d" }}
    className="group flex-shrink-0 w-full max-w-sm mx-2" // <- `group` goes here
  >
    <div
      className="backdrop-blur-lg rounded-2xl px-8 py-9 h-[225px] md:h-[215px] cursor-custom-pointer border border-black shadow-lg transition-all duration-300
                 bg-white hover:bg-black hover:border-white"
    >
      <div className="flex items-center mb-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full mr-3"
        />
        <div>
          <h3
            className="text-base font-semibold text-black group-hover:text-white"
            style={{ fontFamily: "Poppins" }}
          >
            {testimonial.name}
          </h3>
          <p className="text-sm text-gray-700 group-hover:text-gray-300">
            {testimonial.handle} · {testimonial.role}
          </p>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4 group-hover:text-gray-200">
        {testimonial.testimonial}
      </p>
      <div className="flex">{renderStars(testimonial.rating)}</div>
    </div>
  </Tilt>
))}

  </div>
</div>


      {/* Bottom Marquee - Moves Right */}
      <div className="relative overflow-hidden py-2">
        <div className="flex mobile-animate-marquee-right md:animate-marquee-right hover:animate-marquee-right-slow">
           {[...testimonials, ...testimonials].map((testimonial, index) => (
            <Tilt
    key={`${testimonial.id}-${index}`} // <- Move key here
    options={{
      scale: 1.02,
      speed: 300,
      perspective: 1000,
      glare: true,
      "max-glare": 0.2,
    }}
    style={{ transformStyle: "preserve-3d" }}
    className="group flex-shrink-0 w-full max-w-sm mx-2" // <- `group` goes here
  >

            <div
              
              className="group flex-shrink-0 h-[215px] cursor-custom-pointer w-full max-w-sm mx-2 backdrop-blur-lg rounded-2xl px-8 py-9 border border-black shadow-lg transition-all duration-300
              bg-white hover:bg-black hover:border-white"
              >
                <div className="flex items-center mb-4">
                <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-3"
                    />
                <div>
                    <h3
                    className="text-base font-semibold text-black group-hover:text-white"
                    style={{ fontFamily: 'Poppins' }}
                    >
                    {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-700 group-hover:text-gray-300">
                    {testimonial.handle} · {testimonial.role}
                    </p>
                </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 group-hover:text-gray-200">
                {testimonial.testimonial}
                </p>
                <div className="flex">
                {renderStars(testimonial.rating)}
                </div>
            </div>
                        </Tilt>
            ))}
        </div>
      </div>

      
    </div>
  );
};

export default Testimonials;