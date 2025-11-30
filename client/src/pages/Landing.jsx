import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Navbar } from '../components/UI/Navbar'
import { Button } from '../components/UI/Button'
import api from '../utils/api'
import { Heart, Users, Zap, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react'

const Landing = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [topNGOs, setTopNGOs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopNGOs = async () => {
      try {
        const response = await api.get('/ngos?limit=3&sort=-rating')
        setTopNGOs(response.data.data?.ngos || [])
      } catch (error) {
        console.error('Failed to fetch top NGOs:', error)
        // Use mock data if API fails
        setTopNGOs([
          {
            _id: '1',
            name: 'Hope Foundation',
            mission: 'Providing education to underprivileged children',
            category: 'Education',
            image: '🏫',
            rating: 4.8,
            volunteers: 245,
          },
          {
            _id: '2',
            name: 'Health Plus',
            mission: 'Delivering healthcare to remote areas',
            category: 'Healthcare',
            image: '🏥',
            rating: 4.6,
            volunteers: 189,
          },
          {
            _id: '3',
            name: 'Green Earth',
            mission: 'Environmental conservation and sustainability',
            category: 'Environment',
            image: '🌱',
            rating: 4.7,
            volunteers: 312,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTopNGOs()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <motion.section
        className={`relative overflow-hidden px-4 py-20 sm:py-32 ${
          isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                ✨ Empower Communities Together
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="text-gray-900 dark:text-white">Make a </span>
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Real Impact
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className={`text-lg sm:text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Connect with verified NGOs, volunteer your time, and donate to causes you care about. Together, we're building a more compassionate world.
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 py-4"
            >
              {[
                { number: '500+', label: 'NGOs' },
                { number: '50K+', label: 'Volunteers' },
                { number: '₹2Cr+', label: 'Donated' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {stat.number}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                Register as User
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                Register as NGO
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Already registered? <a href="/login" className="text-primary hover:underline font-semibold">Login here</a>
            </motion.p>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Animated Card Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-2xl opacity-30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className={`relative p-8 rounded-2xl border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } shadow-2xl`}>
                <div className="space-y-6">
                  {[
                    { icon: '❤️', text: 'Support Causes' },
                    { icon: '🤝', text: 'Volunteer Time' },
                    { icon: '🏆', text: 'Earn Badges' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                      className="flex items-center gap-4"
                    >
                      <div className="text-4xl">{item.icon}</div>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        className={`px-4 py-20 sm:py-32 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-bold mb-4"
            >
              About <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">SevaSetu</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              SevaSetu is a bridge connecting compassionate individuals with organizations making a real difference. We believe in the power of collective action.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Heart, title: 'Support Causes', desc: 'Donate to verified NGOs and track your impact' },
              { icon: Users, title: 'Find Community', desc: 'Connect with like-minded volunteers and donors' },
              { icon: Zap, title: 'Take Action', desc: 'Join events and make a difference on the ground' },
              { icon: TrendingUp, title: 'Track Impact', desc: 'See real-time stats of your contributions' },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={featureVariants}
                  className={`p-6 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 hover:border-orange-500'
                      : 'bg-white border-gray-200 hover:border-orange-500'
                  }`}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {feature.desc}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Top NGOs Section */}
      <motion.section
        className={`px-4 py-20 sm:py-32 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-bold mb-4"
            >
              Featured <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Organizations</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Partner with some of India's most impactful NGOs and social enterprises
            </motion.p>
          </motion.div>

          {/* NGO Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {topNGOs.map((ngo, index) => (
                <motion.div
                  key={ngo._id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className={`rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 hover:border-orange-500'
                      : 'bg-gray-50 border-gray-200 hover:border-orange-500'
                  }`}
                  onClick={() => navigate(`/ngos/${ngo._id}`)}
                >
                  {/* NGO Header with Image */}
                  <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <motion.div
                      className="text-7xl"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {ngo.image || '🏢'}
                    </motion.div>
                  </div>

                  {/* NGO Info */}
                  <div className="p-6 space-y-4">
                    {/* Name and Category */}
                    <div>
                      <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {ngo.name}
                      </h3>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded-full">
                        {ngo.category}
                      </span>
                    </div>

                    {/* Mission */}
                    <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {ngo.mission}
                    </p>

                    {/* Stats */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {ngo.rating || 4.5}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                          {ngo.volunteers || 0} volunteers
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                      Learn More
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Explore All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Button
              onClick={() => navigate('/map')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 mx-auto transition-all transform hover:scale-105"
            >
              Explore All Organizations
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className={`relative px-4 py-20 sm:py-32 overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-orange-900 to-red-900'
            : 'bg-gradient-to-br from-orange-500 to-red-500'
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-white"
          >
            Ready to Make a Difference?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-white/90 max-w-2xl mx-auto"
          >
            Join thousands of changemakers who are already making an impact. Start your journey with SevaSetu today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all"
            >
              Get Started Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold py-3 px-8 rounded-lg transition-all"
            >
              Sign In
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className={`px-4 py-12 border-t ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {[
              { title: 'Platform', links: ['Find NGOs', 'Browse Events', 'Help Requests'] },
              { title: 'Community', links: ['Leaderboard', 'Badges', 'Certificates'] },
              { title: 'Company', links: ['About', 'Contact', 'Blog'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Guidelines'] },
            ].map((group, index) => (
              <motion.div key={index} variants={itemVariants}>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className={`text-sm hover:text-orange-500 transition ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className={`border-t pt-8 text-center ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              © 2025 SevaSetu. Made with ❤️ for social impact.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default Landing
