import { Quote } from "lucide-react";

interface TestimonialCardProps {
  content: string;
  author: string;
  role: string;
  isActive?: boolean;
}

const TestimonialCard = ({
  content,
  author,
  role,
  isActive = false,
}: TestimonialCardProps) => {
  return (
    <div
      className={`(
        "max-w-3xl mx-auto px-8 py-12 transition-opacity duration-500 ease-in-out",
        ${isActive ? "opacity-100" : "opacity-0 absolute top-0 left-0 right-0"}
      )`}
    >
      <div className="flex justify-center mb-6">
        <Quote className="h-12 w-12 text-gray-300 rotate-180" />
      </div>
      <p className="text-xl md:text-2xl text-gray-800 font-light mb-8 text-center leading-relaxed">
        {content}
      </p>
      <div className="text-center">
        <p className="font-semibold text-lg text-black mb-1">{author}</p>
        <p className="text-gray-500">{role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
