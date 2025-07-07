"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

const SPECIALTIES = [
  { value: 'anxiety', label: 'Anxiety Disorders' },
  { value: 'depression', label: 'Depression' },
  { value: 'trauma', label: 'Trauma & PTSD' },
  { value: 'relationships', label: 'Relationship Issues' },
  { value: 'addiction', label: 'Addiction & Substance Abuse' },
  { value: 'grief', label: 'Grief & Loss' },
  { value: 'eating_disorders', label: 'Eating Disorders' },
  { value: 'family_therapy', label: 'Family Therapy' },
  { value: 'couples_therapy', label: 'Couples Therapy' },
  { value: 'child_therapy', label: 'Child & Adolescent Therapy' },
  { value: 'cognitive_behavioral', label: 'Cognitive Behavioral Therapy' },
  { value: 'mindfulness', label: 'Mindfulness & Meditation' },
  { value: 'other', label: 'Other' },
];

const SESSION_TYPES = [
  { value: 'text', label: 'Text Chat' },
  { value: 'voice', label: 'Voice Calls' },
  { value: 'video', label: 'Video Calls' },
];

export default function TherapistSignup() {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Professional Info
    licenseNumber: '',
    specialties: [],
    yearsOfPractice: '',
    bio: '',
    
    // Credentials
    credentials: [
      {
        type: 'degree',
        name: '',
        institution: '',
        year: '',
      }
    ],
    
    // Contact & Availability
    phone: '',
    sessionTypes: ['text'],
    
    // Other
    location: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const { registerTherapist, isLoading, error, isAuthenticated, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/therapist/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleSpecialtyChange = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSessionTypeChange = (sessionType) => {
    setFormData(prev => ({
      ...prev,
      sessionTypes: prev.sessionTypes.includes(sessionType)
        ? prev.sessionTypes.filter(s => s !== sessionType)
        : [...prev.sessionTypes, sessionType]
    }));
  };

  const handleCredentialChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.map((cred, i) => 
        i === index ? { ...cred, [field]: value } : cred
      )
    }));
  };

  const addCredential = () => {
    setFormData(prev => ({
      ...prev,
      credentials: [...prev.credentials, {
        type: 'certification',
        name: '',
        institution: '',
        year: '',
      }]
    }));
  };

  const removeCredential = (index) => {
    if (formData.credentials.length > 1) {
      setFormData(prev => ({
        ...prev,
        credentials: prev.credentials.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return 'Full name is required';
        if (!formData.email.trim()) return 'Email is required';
        if (!formData.password) return 'Password is required';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        if (formData.password.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
          return 'Password must contain at least one letter and one number';
        }
        break;
      case 2:
        if (!formData.licenseNumber.trim()) return 'License number is required';
        if (formData.specialties.length === 0) return 'Please select at least one specialty';
        if (!formData.yearsOfPractice || formData.yearsOfPractice < 0) return 'Years of practice is required';
        if (formData.credentials.some(cred => !cred.name.trim() || !cred.institution.trim() || !cred.year)) {
          return 'Please complete all credential information';
        }
        break;
      case 3:
        if (formData.sessionTypes.length === 0) return 'Please select at least one session type';
        if (!agreedToTerms) return 'Please agree to the terms and conditions';
        break;
    }
    return null;
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      alert(error);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateStep(currentStep);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const therapistData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        licenseNumber: formData.licenseNumber,
        specialties: formData.specialties,
        yearsOfPractice: parseInt(formData.yearsOfPractice),
        bio: formData.bio,
        credentials: formData.credentials.map(cred => ({
          ...cred,
          year: parseInt(cred.year)
        })),
        phone: formData.phone,
        sessionTypes: formData.sessionTypes,
        location: formData.location,
      };

      await registerTherapist(therapistData);
      // Redirect will happen via useEffect above
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name *
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Enter your full name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Professional Email *
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Enter your professional email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password *
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.658 5.658L15.536 15.536m-1.414-1.414L15.536 15.536" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          At least 8 characters with letters and numbers
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password *
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Confirm your password"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h2>
      </div>

      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
          License Number *
        </label>
        <div className="mt-1">
          <input
            id="licenseNumber"
            name="licenseNumber"
            type="text"
            required
            value={formData.licenseNumber}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Your professional license number"
          />
        </div>
      </div>

      <div>
        <label htmlFor="yearsOfPractice" className="block text-sm font-medium text-gray-700">
          Years of Practice *
        </label>
        <div className="mt-1">
          <input
            id="yearsOfPractice"
            name="yearsOfPractice"
            type="number"
            min="0"
            required
            value={formData.yearsOfPractice}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Specialties * (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {SPECIALTIES.map((specialty) => (
            <label key={specialty.value} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.specialties.includes(specialty.value)}
                onChange={() => handleSpecialtyChange(specialty.value)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{specialty.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Credentials *
        </label>
        {formData.credentials.map((credential, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Credential {index + 1}
              </h4>
              {formData.credentials.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCredential(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Type</label>
                <select
                  value={credential.type}
                  onChange={(e) => handleCredentialChange(index, 'type', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="degree">Degree</option>
                  <option value="certification">Certification</option>
                  <option value="license">License</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={credential.year}
                  onChange={(e) => handleCredentialChange(index, 'year', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="2020"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Name/Title</label>
                <input
                  type="text"
                  value={credential.name}
                  onChange={(e) => handleCredentialChange(index, 'name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Ph.D. in Psychology"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Institution</label>
                <input
                  type="text"
                  value={credential.institution}
                  onChange={(e) => handleCredentialChange(index, 'institution', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="University Name"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addCredential}
          className="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          + Add Another Credential
        </button>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Professional Bio (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Tell patients about your background and approach..."
            maxLength={1000}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {formData.bio.length}/1000 characters
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Contact & Service Details</h2>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number (Optional)
        </label>
        <div className="mt-1">
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location (Optional)
        </label>
        <div className="mt-1">
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="City, State/Country"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Session Types Offered * (Select all that apply)
        </label>
        <div className="space-y-2">
          {SESSION_TYPES.map((sessionType) => (
            <label key={sessionType.value} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sessionTypes.includes(sessionType.value)}
                onChange={() => handleSessionTypeChange(sessionType.value)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{sessionType.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="agree-terms"
          name="agree-terms"
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
          I agree to the{' '}
          <Link href="/terms" className="text-green-600 hover:text-green-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-green-600 hover:text-green-500">
            Privacy Policy
          </Link>
        </label>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Verification Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your credentials will be verified by our team before you can start offering sessions. 
                This process typically takes 2-3 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join as Therapist</h1>
          <p className="mt-2 text-gray-600">Help others while maintaining complete anonymity</p>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step <= currentStep 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < totalSteps && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Basic Info</span>
            <span>Professional</span>
            <span>Services</span>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Previous
                </button>
              )}

              <div className="flex-1" />

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </div>
                  ) : (
                    'Create Therapist Account'
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in here
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Looking to join our community?{' '}
              <Link href="/signup/community" className="font-medium text-indigo-600 hover:text-indigo-500">
                Community Signup
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Therapist Benefits */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Therapist Benefits</h3>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Flexible scheduling and availability settings</li>
            <li>• Complete anonymity and privacy protection</li>
            <li>• Secure, encrypted communication platform</li>
            <li>• Professional verification and credibility</li>
            <li>• Helping those who need it most</li>
            <li>• Supportive professional community</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
