import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiAward, 
  FiZap, 
  FiDollarSign, 
  FiUser, 
  FiShield, 
  FiSmile, 
  FiHeart,
  FiThumbsUp
} from 'react-icons/fi';

// Hook/Sub-component for animated numbers
function AnimatedCounter({ target, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10);
    if (start === end) return;

    const totalMilliseconds = duration;
    let incrementTime = Math.abs(Math.floor(totalMilliseconds / end));
    if (incrementTime < 10) incrementTime = 10;

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMilliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function About() {
  const whyChooseUsFeatures = [
    {
      icon: <FiHeart className="h-6 w-6 text-rust-600" />,
      title: "100% Pure Vegetarian",
      description: "Strictly vegetarian kitchen ensuring complete peace of mind and pure vegetarian dining."
    },
    {
      icon: <FiAward className="h-6 w-6 text-rust-600" />,
      title: "Fresh & Quality Ingredients",
      description: "Directly sourced organic produce and premium ingredients prepared fresh daily."
    },
    {
      icon: <FiZap className="h-6 w-6 text-rust-600" />,
      title: "Fast Service",
      description: "Swift and warm service that ensures your dishes reach you piping hot and fresh."
    },
    {
      icon: <FiDollarSign className="h-6 w-6 text-rust-600" />,
      title: "Affordable Prices",
      description: "Premium dining experience and authentic flavors at friendly prices."
    },
    {
      icon: <FiUser className="h-6 w-6 text-rust-600" />,
      title: "Experienced Chefs",
      description: "Artisan chefs with decades of experience crafting perfect vegetarian cuisines."
    },
    {
      icon: <FiShield className="h-6 w-6 text-rust-600" />,
      title: "Clean & Hygienic Kitchen",
      description: "Highest sanitization standards in preparation, packaging, and delivery."
    }
  ];

  const specialties = [
    {
      image: "/Cold Beverage.jpg",
      title: "Cold Beverages",
      description: "Indulgent milkshakes, cool mojitos, and authentic cold coffees to refresh your mood."
    },
    {
      image: "/Italian Pastas.jpg",
      title: "Italian Pastas",
      description: "Rich, creamy, and herb-infused premium pastas made with fresh vegetarian ingredients."
    },
    {
      image: "/Paneer Ka Khazana.jpg",
      title: "Paneer Ka Khazana",
      description: "Classic North Indian paneer delicacies cooked in rich, aromatic homestyle gravies."
    },
    {
      image: "/Desserts.jpg",
      title: "Desserts",
      description: "Delicious sweet treats, ice cream delights, and rich traditional desserts to finish your meal."
    }
  ];

  const values = [
    {
      icon: <FiAward className="h-8 w-8 text-rust-500 mb-3" />,
      title: "Quality"
    },
    {
      icon: <FiShield className="h-8 w-8 text-rust-500 mb-3" />,
      title: "Hygiene"
    },
    {
      icon: <FiSmile className="h-8 w-8 text-rust-500 mb-3" />,
      title: "Satisfaction"
    },
    {
      icon: <FiHeart className="h-8 w-8 text-rust-500 mb-3" />,
      title: "Fresh Ingredients"
    },
    {
      icon: <FiThumbsUp className="h-8 w-8 text-rust-500 mb-3" />,
      title: "Great Taste"
    }
  ];

  const statistics = [
    { target: "50000", suffix: "+", label: "Happy Customers" },
    { target: "150", suffix: "+", label: "Vegetarian Dishes" },
    { target: "11", suffix: "+", label: "Years of Experience" },
    { target: "1200", suffix: "+", label: "Daily Orders" }
  ];



  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
   
      {/* 2. Our Story Section */}
      <div className="grid gap-12 lg:grid-cols-2 items-center mb-20">
        <div className="space-y-6">
          <span className="text-sm text-rust-500 font-semibold uppercase tracking-wider">Our Story</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            How We Started Our Vegetarian Journey
          </h2>
          <p className="text-slate-600 leading-relaxed text-base">
            Established in 2015, HungryHub was founded with a clear and singular vision: to create a dining destination where vegetarians do not have to compromise on variety, flavor, or presentation. What started as a small, passionate kitchen has blossomed into a beloved culinary landmark.
          </p>
          <p className="text-slate-600 leading-relaxed text-base font-light">
            Every recipe in our menu is a labor of love. We strictly inspect and handpick organic ingredients daily, maintaining a completely eggless and 100% vegetarian workspace. Our commitment to authentic taste and highest hygiene ensures every bite feels both healthy and premium.
          </p>
        </div>
        <div className="relative rounded-[2rem] overflow-hidden shadow-md border-2 border-rust-200 aspect-[4/3] group">
          <img 
            src="/Yummy Pizza.jpg" 
            alt="Authentic Vegetarian Preparation" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      {/* 3. Why Choose Us Section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <span className="text-sm text-rust-500 font-semibold uppercase tracking-wider">Why Choose Us</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">What Sets Us Apart</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUsFeatures.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex flex-col justify-between rounded-2xl border-2 border-rust-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rust-50 border border-rust-100 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Our Specialties Section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <span className="text-sm text-rust-500 font-semibold uppercase tracking-wider">Our Specialties</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Popular Culinary Highlights</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {specialties.map((specialty, idx) => (
            <div 
              key={idx} 
              className="flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-rust-200 bg-white shadow-sm hover:shadow-md transition duration-300"
            >
              <div>
                <div className="h-44 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={specialty.image} 
                    alt={specialty.title} 
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-rust-900">{specialty.title}</h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{specialty.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Our Values Section */}
      <div className="mb-20 bg-rust-50/50 rounded-[2rem] p-8 md:p-12 border-2 border-rust-100">
        <div className="text-center mb-10">
          <span className="text-sm text-rust-500 font-semibold uppercase tracking-wider">Our Philosophy</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">The Values We Live By</h2>
        </div>
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-center">
          {values.map((val, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-rust-200 bg-white shadow-sm hover:shadow-md transition duration-300"
            >
              {val.icon}
              <span className="text-sm font-semibold text-slate-800">{val.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Restaurant Statistics Section */}
      <div className="mb-20 grid gap-6 grid-cols-2 md:grid-cols-4 text-center">
        {statistics.map((stat, idx) => (
          <div 
            key={idx} 
            className="rounded-2xl border-2 border-rust-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300"
          >
            <p className="text-3xl sm:text-4xl font-extrabold text-rust-500">
              <AnimatedCounter target={stat.target} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>




      {/* Call to Action Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-rust-700 to-rust-600 text-white p-12 sm:p-16 text-center shadow-lg">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Experience Great Taste?</h2>
          <p className="mt-4 text-rust-100 text-sm sm:text-base md:text-lg leading-relaxed font-light">
            Savor our handcrafted vegetarian culinary creations from the comfort of your home or join us for an exquisite dining experience.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/order-now" 
              className="w-full sm:w-auto px-8 py-3 text-base font-bold bg-white text-rust-600 rounded-full hover:bg-rust-50 transition shadow-md"
            >
              Order Now
            </Link>
            <Link 
              to="/reserve" 
              className="w-full sm:w-auto px-8 py-3 text-base font-bold border-2 border-white text-white rounded-full hover:bg-rust-700/50 transition"
            >
              Reserve a Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
