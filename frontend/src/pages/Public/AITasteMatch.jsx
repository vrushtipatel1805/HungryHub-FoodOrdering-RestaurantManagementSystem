import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Flame, 
  DollarSign, 
  Utensils, 
  Smile, 
  Clock, 
  TrendingUp, 
  Heart, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  let backendBase = 'http://localhost:8000';
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.startsWith('http')) {
    try {
      const urlObj = new URL(envUrl);
      backendBase = urlObj.origin;
    } catch (e) {
      // Ignore
    }
  }
  let cleanPath = imagePath;
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  if (cleanPath.startsWith('media/')) {
    return `${backendBase}/${cleanPath}`;
  }
  return `${backendBase}/media/${cleanPath}`;
};

export default function AITasteMatch() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    food_preference: 'Veg',
    spice_level: [],
    taste_preference: [],
    meal_type: [],
    budget: [],
    mood: [],
    hunger_level: []
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Fallback questions if backend fails
  const fallbackQuestions = [
    {
      key: "spice_level",
      text: "Spice Level",
      options: [
        { text: "Mild", value: "Mild" },
        { text: "Medium", value: "Medium" },
        { text: "Spicy", value: "Spicy" },
        { text: "Extra Spicy", value: "Extra Spicy" }
      ]
    },
    {
      key: "taste_preference",
      text: "Taste Preference",
      options: [
        { text: "Sweet", value: "Sweet" },
        { text: "Salty", value: "Salty" },
        { text: "Tangy", value: "Tangy" },
        { text: "Creamy", value: "Creamy" },
        { text: "Cheesy", value: "Cheesy" }
      ]
    },
    {
      key: "meal_type",
      text: "Meal Type",
      options: [
        { text: "Lunch", value: "Lunch" },
        { text: "Dinner", value: "Dinner" },
        { text: "Snacks", value: "Snacks" },
        { text: "Dessert", value: "Dessert" },
        { text: "Beverage", value: "Beverage" }
      ]
    },
    {
      key: "budget",
      text: "Budget",
      options: [
        { text: "Under ₹200", value: "Under ₹200" },
        { text: "₹200–₹500", value: "₹200–₹500" },
        { text: "₹500–₹1000", value: "₹500–₹1000" },
        { text: "Above ₹1000", value: "Above ₹1000" }
      ]
    },
    {
      key: "mood",
      text: "Mood",
      options: [
        { text: "Happy", value: "Happy" },
        { text: "Family Dinner", value: "Family Dinner" },
        { text: "Party", value: "Party" },
        { text: "Romantic", "value": "Romantic" },
        { text: "Office Lunch", "value": "Office Lunch" },
        { text: "Celebration", "value": "Celebration" }
      ]
    },
    {
      key: "hunger_level",
      text: "Hunger Level",
      options: [
        { text: "Light", value: "Light" },
        { text: "Medium", value: "Medium" },
        { text: "Very Hungry", value: "Very Hungry" }
      ]
    }
  ];

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/taste-match/questions/');
        if (res.data?.ok && res.data.questions?.length > 0) {
          setQuestions(res.data.questions);
        } else {
          setQuestions(fallbackQuestions);
        }
      } catch (err) {
        console.warn("Backend API error, using static fallback questions.");
        setQuestions(fallbackQuestions);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleSelectOption = (key, value) => {
    setAnswers(prev => {
      const currentSelection = prev[key];
      if (Array.isArray(currentSelection)) {
        if (currentSelection.includes(value)) {
          return {
            ...prev,
            [key]: currentSelection.filter(item => item !== value)
          };
        } else {
          return {
            ...prev,
            [key]: [...currentSelection, value]
          };
        }
      }
      return { ...prev, [key]: value };
    });
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    const selection = answers[currentQuestion.key];
    if (!selection || (Array.isArray(selection) && selection.length === 0)) {
      toast.error(`Please select at least one option for ${currentQuestion.text}`);
      return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Check validation
    const missing = Object.keys(answers).find(k => {
      const val = answers[k];
      if (k === 'food_preference') return !val;
      return !val || (Array.isArray(val) && val.length === 0);
    });
    if (missing) {
      const q = questions.find(qu => qu.key === missing) || { text: missing };
      toast.error(`Please select at least one option for: ${q.text}`);
      return;
    }

    setSubmitting(true);
    // Add artificial delay for generating recommendations animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await api.post('/taste-match/recommend/', answers);
      if (res.data?.ok) {
        setResult(res.data);
        toast.success("We found your perfect match!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Recommendation error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = async (item, redirect = false) => {
    try {
      // Map item object to conform to CartContext signature
      const mappedItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        discount: item.discount || 0,
        image: item.image,
        gst: item.gst || 5
      };
      await addItem(mappedItem);
      
      // Update recommendation ordered status in database if recommendation id exists
      if (result?.recommendation_id && user && user.name !== 'Guest') {
        try {
          await api.patch('/admin/taste-match/history/', {
            id: result.recommendation_id,
            is_ordered: true
          });
        } catch (e) {
          // Silent fallback
        }
      }

      toast.success(`${item.name} added to cart!`);
      if (redirect) {
        navigate('/checkout');
      }
    } catch (err) {
      toast.error("Failed to add item to cart.");
    }
  };

  const handleReset = () => {
    setAnswers({
      food_preference: 'Veg',
      spice_level: [],
      taste_preference: [],
      meal_type: [],
      budget: [],
      mood: [],
      hunger_level: []
    });
    setResult(null);
    setCurrentStep(0);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4">
        <RefreshCw className="h-10 w-10 animate-spin text-rust-500" />
        <p className="text-sm font-semibold text-slate-500">Loading AI taste wizard...</p>
      </div>
    );
  }

  const stepProgress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rust-50 text-rust-600 shadow-md"
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            AI Taste Match
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            Answer a few quick questions and let our AI engine analyze your preferences to pair you with the absolute perfect dish.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            /* Questionnaire Step Container */
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-xl rounded-3xl border border-rust-100 bg-white p-6 shadow-xl md:p-8"
            >
              {submitting ? (
                /* Generating Animation Loader */
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center gap-6">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-rust-100 border-t-rust-500"
                    />
                    <Sparkles className="h-8 w-8 text-rust-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Generating Recommendation</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      AI is mapping your taste notes, matching spice thresholds, and filtering restaurant inventory...
                    </p>
                  </div>
                </div>
              ) : (
                /* Question Layout */
                currentQuestion && (
                  <div>
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Question {currentStep + 1} of {questions.length}</span>
                        <span>{Math.round(stepProgress)}% Complete</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          className="h-full bg-rust-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${stepProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Question Title */}
                    <h2 className="text-xl font-bold text-slate-800 mb-6">
                      {currentQuestion.text}
                    </h2>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {currentQuestion.options.map((opt) => {
                        const currentSelection = answers[currentQuestion.key];
                        const isSelected = Array.isArray(currentSelection)
                          ? currentSelection.includes(opt.value)
                          : currentSelection === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleSelectOption(currentQuestion.key, opt.value)}
                            className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold text-left transition-all duration-200 ${
                              isSelected
                                ? 'bg-rust-50 border-rust-500 text-rust-600 shadow-md ring-2 ring-rust-500/20'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-rust-200 hover:bg-slate-50/50'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isSelected && (
                              <div className="h-2 w-2 rounded-full bg-rust-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                      <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none`}
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>

                      {currentStep < questions.length - 1 ? (
                        <button
                          onClick={handleNext}
                          className="flex items-center gap-1.5 rounded-full bg-rust-500 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-rust-600 shadow-md shadow-rust-600/10"
                        >
                          Next <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rust-500 to-amber-600 px-8 py-3 text-xs font-bold text-white transition hover:scale-[1.02] shadow-md shadow-rust-600/20"
                        >
                          Find My Perfect Dish <Sparkles className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </motion.div>
          ) : (
            /* recommendation layout display */
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Main Card */}
              <div className="overflow-hidden rounded-3xl border border-rust-100 bg-white shadow-xl">
                <div className="bg-gradient-to-r from-rust-500 to-amber-600 px-6 py-4 text-center text-white">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-100">AI Recommendation</span>
                  <h2 className="text-xl font-bold tracking-tight mt-0.5">Today's Best Match For You</h2>
                </div>

                <div>
                  {/* Specifications details */}
                  <div className="p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rust-500 bg-rust-50 px-2.5 py-1 rounded-full">
                            {result.main_recommendation.category}
                          </span>
                          <span className="rounded-full bg-rust-100 px-2.5 py-1 text-[10px] font-extrabold text-rust-600 shadow-xs flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5 fill-rust-500 text-rust-500" />
                            <span>{result.main_recommendation.match_score}% Match</span>
                          </span>
                        </div>
                        {/* Rating Display */}
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{result.main_recommendation.rating} / 5.0</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-slate-800 mt-4">
                        {result.main_recommendation.name}
                      </h3>

                      <p className="text-xl font-black text-rust-600 mt-1">
                        ₹{result.main_recommendation.price}
                      </p>

                      <p className="text-slate-550 text-xs mt-3 leading-relaxed">
                        {result.main_recommendation.description}
                      </p>

                      {/* Quick Details Indicators */}
                      <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 mt-5">
                        <div className="text-center">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase">Preparation</span>
                          <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                            <Clock className="h-3.5 w-3.5 text-slate-500" /> {result.main_recommendation.preparation_time} Mins
                          </span>
                        </div>
                        <div className="text-center border-x border-slate-100">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase">Energy</span>
                          <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                            <Flame className="h-3.5 w-3.5 text-orange-500" /> {result.main_recommendation.calories} Kcal
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase">Flavor Profiling</span>
                          <span className="text-xs font-bold text-slate-700 mt-0.5 block truncate">
                            {result.main_recommendation.taste_type}
                          </span>
                        </div>
                      </div>

                      {/* Reason Box */}
                      <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 mt-5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Match Reason</span>
                        <p className="text-xs text-amber-900 mt-0.5">
                          {result.main_recommendation.reason}
                        </p>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        onClick={() => handleAddToCart(result.main_recommendation, false)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-rust-500 bg-white py-3 text-xs font-bold text-rust-500 transition hover:bg-rust-50 shadow-sm"
                      >
                        <ShoppingBag className="h-4 w-4" /> Add to Cart
                      </button>
                      <button
                        onClick={() => handleAddToCart(result.main_recommendation, true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-rust-500 py-3 text-xs font-bold text-white transition hover:bg-rust-600 shadow-md shadow-rust-600/10"
                      >
                        Order Now <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Recommendations "You may also like" */}
              {result.related_recommendations?.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Heart className="text-rust-500 fill-rust-500 h-5 w-5" /> You may also like
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {result.related_recommendations.map((item) => (
                      <div key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition p-5 space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-black uppercase text-rust-500">{item.category}</span>
                            <span className="rounded-full bg-rust-50 px-2 py-0.5 text-[9px] font-extrabold text-rust-600 flex items-center gap-0.5">
                              <Zap className="h-3 w-3 fill-rust-500 text-rust-500" />
                              <span>{item.match_score}%</span>
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mt-2 truncate">{item.name}</h4>
                          <span className="font-black text-slate-900 text-xs mt-1 block">₹{item.price}</span>
                          <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">{item.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleAddToCart(item, false)}
                            className="rounded-lg border border-rust-500 py-2 text-[10px] font-bold text-rust-500 text-center hover:bg-rust-50 transition"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => handleAddToCart(item, true)}
                            className="rounded-lg bg-rust-500 py-2 text-[10px] font-bold text-white text-center hover:bg-rust-600 transition"
                          >
                            Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Try Again Footer */}
              <div className="text-center pb-8">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-200 hover:bg-slate-300 px-6 py-3 text-xs font-bold text-slate-700 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Start Taste Questionnaire Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
