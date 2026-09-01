import React, { useState } from "react";
import Cyber from "../assets/cyber.jpeg";
import { motion } from "framer-motion";

function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    title: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: "",
        email: "",
        title: "",
        message: ""
      });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-30 flex items-center justify-center text-white px-6 relative overflow-hidden bg-black"
    >
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 relative z-10">
        {/* Left Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
            Let's Get{" "}
            <span className="text-[#BD0927] relative">
              Connected
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-[#BD0927]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span>
            .
          </h1>
          <p className="text-gray-300 relative">
            Just send us an email directly at{" "}
            <a
              href="mailto:tt.acumen@gmail.com"
              className="text-[#09D8C7] underline hover:text-[#BD0927] transition-all duration-300 relative group"
            >
              tt.acumen@gmail.com
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#BD0927] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
            <br />
             Or use the Whatsapp group
          </p>

          {/* Clean Image Card (No Gradient / Glow) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative overflow-hidden rounded-lg mt-8"
          >
            <div className="relative bg-black/40 backdrop-blur-sm p-6 rounded-lg overflow-hidden">
              <img
                src={Cyber}
                alt="envelope"
                className="md:flex hidden w-full h-[27em] rounded-lg relative z-10 transform hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Right Section (Form) */}
        <motion.form
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl relative overflow-hidden hover:bg-white/15 transition-all duration-300"
          style={{
            boxShadow:
              "0 0 20px rgba(189, 9, 39, 0.1), 0 0 40px rgba(9, 216, 199, 0.1)"
          }}
        >
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[#09D8C7]/90 z-20"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl mb-2"
                >
                  ✓
                </motion.div>
                <p className="font-semibold">Message Sent Successfully!</p>
              </div>
            </motion.div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div className="relative">
              <label className="block text-sm mb-2 text-[#09D8C7] uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#BD0927] text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10"
                required
              />
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#09D8C7]"
                initial={{ width: "0%" }}
                animate={{ width: formData.fullName ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-sm mb-2 text-[#09D8C7] uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#BD0927] text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10"
                required
              />
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#09D8C7]"
                initial={{ width: "0%" }}
                animate={{ width: formData.email ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Title */}
            <div className="relative">
              <label className="block text-sm mb-2 text-[#09D8C7] uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Write a short title for your problem..."
                maxLength={60}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#BD0927] text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10"
                required
              />
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#09D8C7]"
                initial={{ width: "0%" }}
                animate={{ width: formData.title ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Message */}
            <div className="relative">
              <label className="block text-sm mb-2 text-[#09D8C7] uppercase tracking-wider">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message..."
                maxLength={300}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#BD0927] text-white placeholder-gray-400 h-28 resize-none transition-all duration-300 hover:bg-white/10"
                required
              />
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#09D8C7]"
                initial={{ width: "0%" }}
                animate={{ width: formData.message ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                {formData.message.length}/300
              </span>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg ${
                loading
                  ? "bg-[#500A1F]/50 cursor-not-allowed"
                  : "bg-white/5 hover:bg-[#500A1F]"
              } border border-white/10 transition-all duration-300 font-semibold tracking-wide flex items-center justify-center space-x-2`}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <span>Send Message</span>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
}

export default Contact;