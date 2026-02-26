
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            About Color → Buy Coach
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            From Diagnosis to Purchase, All in One Place.
          </p>
        </div>
        <div className="mt-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p className="mt-2 text-gray-600">
                Finding your personal color is just the beginning. The real challenge lies in finding products that truly match your tone. 'Color → Buy Coach' was born to solve this very problem. We provide a seamless experience, taking you from an AI-powered personal color diagnosis directly to a curated list of products that will make you shine.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">How It Works</h3>
              <p className="mt-2 text-gray-600">
                1. <strong>Upload Your Photo:</strong> Our advanced AI analyzes your photo to determine your precise personal color tone (e.g., Spring Bright, Autumn Mute).
              </p>
              <p className="mt-2 text-gray-600">
                2. <strong>Get Instant Recommendations:</strong> Based on your diagnosis, we instantly present you with a handpicked selection of 3 cosmetics and fashion items.
              </p>
              <p className="mt-2 text-gray-600">
                3. <strong>Shop with Confidence:</strong> Each recommended item is linked to a purchase page, allowing you to shop with the confidence that the color is right for you.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              <p className="mt-2 text-gray-600">
                We aim to become an automated monetization engine that generates revenue through affiliate marketing (Coupang Partners) and advertising (Google AdSense). By achieving a high retention rate and proving our business model, we plan to scale globally and potentially seek a strategic exit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
