import React from 'react';
import { 
  FiHeart, 
  FiShield, 
  FiUsers, 
  FiStar, 
  FiTarget,
  FiCheckCircle,
  FiAward,
  FiSmile
} from 'react-icons/fi';

const AboutUs = () => {
  const features = [
    {
      title: "100% Pure Vegetarian",
      description: "Every restaurant and food item on our platform is verified to be 100% pure vegetarian with no exceptions."
    },
    {
      icon: <FiShield className="text-3xl text-blue-600" />,
      title: "Strict Quality Standards",
      description: "We maintain rigorous verification processes to ensure all vendors meet our vegetarian standards."
    },
    {
      icon: <FiUsers className="text-3xl text-purple-600" />,
      title: "Trusted Community",
      description: "Join thousands of customers who trust Vegiffy for their daily vegetarian food needs."
    },
    {
      icon: <FiTarget className="text-3xl text-orange-600" />,
      title: "Clear Mission",
      description: "Making vegetarian food easy to discover, order, and enjoy for everyone."
    }
  ];

  const values = [
    {
      icon: <FiHeart className="text-2xl text-red-500" />,
      title: "Passion for Vegetarianism",
      description: "We believe in the power of plant-based living and its positive impact on health and environment."
    },
    {
      icon: <FiCheckCircle className="text-2xl text-green-500" />,
      title: "Zero Tolerance Policy",
      description: "Strict no non-vegetarian food policy ensures complete peace of mind for our customers."
    },
    {
      icon: <FiAward className="text-2xl text-yellow-500" />,
      title: "Quality Assurance",
      description: "Every vendor undergoes thorough verification before joining our platform."
    },
    {
      icon: <FiSmile className="text-2xl text-blue-500" />,
      title: "Customer Happiness",
      description: "Your satisfaction and trust are our top priorities in everything we do."
    }
  ];

  const partnerTypes = [
    "Pure Vegetarian Restaurants",
    "Verified Hotels",
    "Traditional Sweet Shops", 
    "Fresh Juice Parlours",
    "Cloud Kitchens",
    "Bakeries & Cafés"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-yellow-300">Vegiffy</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto leading-relaxed">
            India's Trusted 100% Pure Vegetarian Food Delivery Platform
          </p>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Created with a simple yet powerful mission — to make vegetarian food easy to discover, 
              order, and enjoy for millions of people across India.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <FiTarget className="text-yellow-300" />
                  Our Core Mission
                </h3>
                <p className="text-lg leading-relaxed text-green-100">
                  To create a trusted platform where vegetarians can order food with complete confidence, 
                  knowing every meal follows strict vegetarian standards without compromise.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Pure Vegetarian Focus</h4>
                  <p className="text-gray-600">
                    Dedicated exclusively to vegetarian cuisine, ensuring no cross-contamination or confusion.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiShield className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Verified Partners</h4>
                  <p className="text-gray-600">
                    Every restaurant and vendor undergoes strict verification before joining our platform.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUsers className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Community Trust</h4>
                  <p className="text-gray-600">
                    Building a community of vegetarians who can enjoy diverse cuisines with complete trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Vegiffy?
            </h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We understand the importance of food choices rooted in health, belief, culture, and lifestyle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-100"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operation Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Operated by{" "}
                <span className="text-green-600">Jainity Eats India Private Limited</span>
              </h2>
              <div className="w-20 h-1 bg-green-600 mb-6"></div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Vegiffy connects customers with trusted pure vegetarian restaurants, hotels, 
                sweet shops, juice parlours, and cloud kitchens, ensuring every meal ordered 
                through our platform follows strict vegetarian standards.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <FiShield className="text-yellow-600" />
                  Zero Tolerance Policy
                </h4>
                <p className="text-yellow-700">
                  We maintain a clear policy of zero tolerance for non-vegetarian food on our platform. 
                  Your trust is our responsibility.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {partnerTypes.map((type, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white h-48 flex flex-col justify-center">
                  <FiStar className="text-3xl text-yellow-300 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Verified Vendors</h3>
                  <p className="text-green-100">All partners thoroughly checked</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-white h-48 flex flex-col justify-center">
                  <FiUsers className="text-3xl mb-3" />
                  <h3 className="text-xl font-bold mb-2">Growing Community</h3>
                  <p className="text-blue-100">Thousands of happy customers</p>
                </div>
              </div>
              <div className="space-y-6 mt-12">
                <div className="bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl p-6 text-white h-48 flex flex-col justify-center">
                  <h3 className="text-xl font-bold mb-2">Pure Vegetarian</h3>
                  <p className="text-purple-100">100% vegetarian guarantee</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white h-48 flex flex-col justify-center">
                  <FiAward className="text-3xl mb-3" />
                  <h3 className="text-xl font-bold mb-2">Quality Promise</h3>
                  <p className="text-orange-100">Highest standards maintained</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Our Core Values
            </h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              The principles that guide everything we do at Vegiffy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {value.title}
                </h3>
                <p className="text-green-100 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Vegiffy
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              India's First 100% Pure Vegetarian Food Delivery Platform - Where Trust Meets Taste
            </p>
            <p className="text-gray-500">
              © 2024 Jainity Eats India Private Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;