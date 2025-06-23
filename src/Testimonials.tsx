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
      "LonewolfFSD helped launch our MVP with speed and precision. Their team was incredibly responsive and the backend was airtight.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Aarav",
  },
  {
    id: 2,
    name: "Meera Patel",
    role: "UI/UX Designer",
    handle: "@meeradesigns",
    testimonial:
      "From domain setup to deployment, everything was smooth. The UI delivery was pixel-perfect and mobile-friendly.",
    rating: 4,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Meera",
  },
  {
    id: 3,
    name: "James Walker",
    role: "Product Manager",
    handle: "@jwpm",
    testimonial:
      "Clear communication, fast turnarounds, and secure infrastructure. LonewolfFSD is a partner I trust for full-stack delivery.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=James",
  },
  {
    id: 4,
    name: "高橋 美咲 (Misaki Takahashi)",
    role: "Webディレクター",
    handle: "@misaki_web",
    testimonial:
      "迅速な対応と丁寧な開発、信頼できるサービスでした。LonewolfFSDのおかげで安心してプロジェクトを進められました。",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Misaki",
  },
  {
    id: 5,
    name: "Miguel Santos",
    role: "Freelance Developer",
    handle: "@migscode",
    testimonial:
      "LonewolfFSD helped me scale my client work. The backend delivery was modular and easy to extend. Will definitely collab again.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Miguel",
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
  <div className="flex animate-marquee-left hover:animate-marquee-left-slow">
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
        <div className="flex animate-marquee-right hover:animate-marquee-right-slow">
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