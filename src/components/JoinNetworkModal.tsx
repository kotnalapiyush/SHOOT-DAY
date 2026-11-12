import React, { useState } from 'react';
import { Camera, CheckCircle2, X, MapPin, Mail, Phone, User, Sparkles } from 'lucide-react';
import { PhotographerProfile } from '../types';

interface JoinNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySuccess?: (photographer: PhotographerProfile) => void;
}

export const JoinNetworkModal: React.FC<JoinNetworkModalProps> = ({
  isOpen,
  onClose,
  onApplySuccess,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [specialty, setSpecialty] = useState('Commercial Shoot');
  const [experience, setExperience] = useState('5');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [portfolio, setPortfolio] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPhotog: PhotographerProfile = {
      id: `photog-applied-${Date.now()}`,
      name,
      city,
      title: `${specialty} Specialist`,
      phone,
      email,
      bio: `Verified specialist with ${experience}+ years experience in ${specialty}. Portfolio: ${portfolio}`,
      specialties: [specialty, 'Commercial Shoot', 'One Day Shoot'],
      experienceYears: parseInt(experience, 10) || 5,
      avatarColor: 'from-[#33684C] to-[#1F4331]',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    };

    if (onApplySuccess) {
      onApplySuccess(newPhotog);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E3EEE7] relative animate-in fade-in zoom-in-95 duration-150 text-[#12201A]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#5C6E5E] hover:text-[#12201A] p-1.5 rounded-xl hover:bg-[#F6F3EC] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#E3EEE7] text-[#33684C] border border-[#E3EEE7] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#12201A] font-headline">Application Submitted!</h3>
            <p className="text-sm text-[#5C6E5E] max-w-xs mx-auto">
              Our creative producer team will review your portfolio and verify your Shoot Lobby availability network account within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EEE7] text-[#33684C] border border-[#E3EEE7] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#33684C]" />
                <span>Shoot Lobby Network Onboarding</span>
              </div>
              <h3 className="text-2xl font-bold text-[#12201A] tracking-tight font-headline">
                Join our Verified Network
              </h3>
              <p className="text-xs text-[#5C6E5E]">
                Get discovered by India's top brands, agencies, and production teams with transparent calendar bookings.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#12201A] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5C6E5E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sehgal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F6F3EC] border border-[#E3EEE7] rounded-xl text-xs font-medium text-[#12201A] focus:outline-none focus:border-[#33684C] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#12201A] mb-1">Primary Base City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#E3EEE7] rounded-xl text-xs font-medium text-[#12201A] focus:outline-none focus:border-[#33684C] focus:bg-white cursor-pointer"
                  >
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Jaipur & Udaipur">Jaipur & Udaipur</option>
                    <option value="Goa">Goa</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#12201A] mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#E3EEE7] rounded-xl text-xs font-medium text-[#12201A] focus:outline-none focus:border-[#33684C] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12201A] mb-1">Primary Specialty</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#E3EEE7] rounded-xl text-xs font-medium text-[#12201A] focus:outline-none focus:border-[#33684C] focus:bg-white cursor-pointer"
                >
                  <option value="Commercial Shoot">Commercial Shoot</option>
                  <option value="Fashion Shoot">Editorial & Fashion Shoot</option>
                  <option value="Jewellery Shoot">Jewellery & Luxury Goods</option>
                  <option value="Hotel Shoot">Hotel & Architecture Shoot</option>
                  <option value="F&B Shoot">F&B and Culinary Shoot</option>
                  <option value="Restaurant & Cafe Shoot">Restaurant & Cafe Lifestyle</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#12201A] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#E3EEE7] rounded-xl text-xs font-medium text-[#12201A] focus:outline-none focus:border-[#33684C] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#12201A] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#E3EEE7] rounded-xl text-xs font-medium text-[#12201A] focus:outline-none focus:border-[#33684C] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12201A] mb-1">Portfolio Link</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/your_handle or website"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#E3EEE7] rounded-xl text-xs font-medium text-[#12201A] focus:outline-none focus:border-[#33684C] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#33684C] hover:bg-[#1F4331] text-white font-bold rounded-xl text-sm transition mt-4 shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Submit Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
