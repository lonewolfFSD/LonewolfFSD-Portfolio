import { useState, useEffect } from "react";
import TestimonialCard from "./TestimonialCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    content:
      "This product has completely transformed our business operations. The efficiency we've gained is remarkable, and the interface is incredibly intuitive.",
    author: "Sarah Johnson",
    role: "Marketing Director",
  },
  {
    content:
      "I've never experienced such seamless integration before. The support team has been exceptional throughout our onboarding process.",
    author: "Michael Chen",
    role: "CTO, TechNova",
  },
  {
    content:
      "Within just three months of implementation, we've seen a 40% increase in productivity and significant cost savings across all departments.",
    author: "Alicia Rodriguez",
    role: "Operations Manager",
  },
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleNavigation = (fn: () => void) => {
    fn();
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="pb-20 bg-white">
      <div className="container mx-auto px-4">

        <div className="relative min-h-[300px]">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              content={testimonial.content}
              author={testimonial.author}
              role={testimonial.role}
              isActive={index === activeIndex}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-12">
          <button
            onClick={() => handleNavigation(prevTestimonial)}
            className="p-1.5 mt-[-10px] mr-10 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className={`w-2.5 h-2.5 rounded-full mx-1 transition-colors ${
                index === activeIndex ? "bg-black" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
          <button
            onClick={() => handleNavigation(nextTestimonial)}
            className="p-1.5 mt-[-10px] ml-10 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;