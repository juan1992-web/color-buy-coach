
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h2>
        </div>
        <div className="mt-12 text-left space-y-6 text-gray-700">
          <p><strong>Last updated: July 24, 2024</strong></p>

          <p>
            Your privacy is important to us. It is Color → Buy Coach's policy to respect your privacy regarding any information we may collect from you across our website.
          </p>

          <h3 className="text-xl font-bold text-gray-900">1. Information We Collect</h3>
          <p>
            <strong>Uploaded Images:</strong> We temporarily process the image you upload to perform the AI-powered personal color analysis. The image is used solely for the purpose of this analysis and is not stored on our servers or shared with any third parties. The image is discarded immediately after the analysis is complete.
          </p>
          <p>
            <strong>Log Data:</strong> Like most website operators, we collect information that your browser sends whenever you visit our site. This may include your computer's Internet Protocol (IP) address, browser type, browser version, the pages of our site that you visit, the time and date of your visit, and other statistics. This data is used for analytical purposes to improve our service.
          </p>

          <h3 className="text-xl font-bold text-gray-900">2. Use of Information</h3>
          <p>
            The information we collect is used to:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900">3. Cookies</h3>
          <p>
            We use cookies to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h3 className="text-xl font-bold text-gray-900">4. Third-Party Services</h3>
          <p>
            We may use third-party services such as Google Analytics and Google AdSense. These services may collect information used to identify you. We recommend reviewing their privacy policies.
          </p>
          <p>
            Our service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites.
          </p>

          <h3 className="text-xl font-bold text-gray-900">5. Changes to This Privacy Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h3 className="text-xl font-bold text-gray-900">6. Contact Us</h3>
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
