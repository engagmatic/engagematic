import { motion } from "framer-motion";
import { Gift, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ReferralSection() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate("/referrals");
    } else {
      navigate("/signup");
    }
  };

  // Profile photos using diverse professional avatars
  const profiles = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=9",
    "https://i.pravatar.cc/150?img=14",
    "https://i.pravatar.cc/150?img=20",
  ];

  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-b from-purple-50/50 to-white">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full mb-4"
            >
              <Gift className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">
                Referral Rewards
              </span>
            </motion.div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Refer Friends,{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Get Free Months
              </span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-xl mx-auto lg:mx-0">
              Share LinkedInPulse with your network and earn 1 month FREE for every friend who becomes a paying customer.
            </p>

            {/* Quick Benefits */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Unlimited rewards</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Friends get 14-day trial</span>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={handleClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {isAuthenticated ? "View Referral Dashboard" : "Start Earning Free Months"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            {/* Social Proof - Profile photos */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-3">
                {profiles.map((photo, i) => (
                  <motion.img
                    key={i}
                    src={photo}
                    alt={`User ${i + 1}`}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-white shadow-md object-cover"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">100+ users</p>
                <p className="text-xs text-gray-600">already earning</p>
              </div>
            </div>
          </motion.div>

          {/* Right side - Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <div className="relative">
                {/* Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="inline-flex p-3 sm:p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 sm:mb-6"
                >
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>

                {/* Main benefit */}
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                  1 Month FREE
                </h3>
                <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8">
                  For every friend who makes their first payment
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">∞</div>
                    <div className="text-xs sm:text-sm text-white/80">No Limits</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">100+</div>
                    <div className="text-xs sm:text-sm text-white/80">Active Users</div>
                  </div>
                </div>

                {/* Note */}
                <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-xs sm:text-sm text-white/90">
                    💡 Rewards apply after your friend's first payment
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

