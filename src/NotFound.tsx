import React from 'react';
import ShinyText from './ShinyText';
import { DotPatternWithGlowEffectDemo } from './DotPattern';
import Helmet from 'react-helmet';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black">
      <Helmet>
        <title>404 - Not Found</title>
      </Helmet>
      <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="relative h-[800px] w-full overflow-hidden">
          <DotPatternWithGlowEffectDemo />
        </div>
      </div>
      <img
        src="https://cdni.iconscout.com/illustration/premium/thumb/sleeping-white-cat-404-flash-message-illustration-download-in-svg-png-gif-file-formats--lying-down-number-zero-nap-pack-website-development-illustrations-7291805.png"
        alt="Sleeping White Cat 404"
        className="w-auto h-80 mb-4"
      />
      <p className="text-lg md:text-xl mb-8 text-gray-600 text-center max-w-md">
        Agrr! This page is napping somewhere else. Let's get you back home.
      </p>
      <a
        href="/"
        style={{
          fontFamily: 'Poppins'
        }}
        className="px-10 cursor-custom-pointer py-4 bg-black text-white text-[15px] rounded-full transition-colors duration-300"
      >
        <ShinyText text="Back To Home" disabled={false} speed={3} className='custom-class' />
      </a>
    </div>
  );
};

export default NotFoundPage;