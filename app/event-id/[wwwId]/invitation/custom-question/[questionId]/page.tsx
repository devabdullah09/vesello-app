"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useInvitation } from '@/components/invitation-context';
import EventHeader from '@/components/layout/EventHeader';

interface CustomQuestion {
  id: string;
  event_id: string;
  question_type: 'yes_no' | 'multiple_choice' | 'text' | 'attendance' | 'food_preference';
  title: string;
  description?: string;
  options: string[];
  required: boolean;
  order_index: number;
  is_active: boolean;
}

export default function CustomQuestionPage({ params }: { params: Promise<{ wwwId: string; questionId: string }> }) {
  const { state, dispatch } = useInvitation();
  const router = useRouter();
  const [question, setQuestion] = useState<CustomQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responses, setResponses] = useState<{ [guestName: string]: any }>({});
  const [nextQuestionId, setNextQuestionId] = useState<string | null>(null);
  const [wwwId, setWwwId] = useState<string>('');

  // Memoize guest names to prevent infinite loops
  const guests = useMemo(() => {
    const names = [state.mainGuest.name, ...state.additionalGuests.map(g => g.name)];
    return names.filter(name => name.trim() !== '');
  }, [state.mainGuest.name, state.additionalGuests]);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setWwwId(resolvedParams.wwwId);
      fetchQuestion(resolvedParams.wwwId, resolvedParams.questionId);
    };
    loadParams();
  }, [params]);

  // Initialize responses when guests change
  useEffect(() => {
    if (guests.length > 0 && question) {
      const initialResponses: { [guestName: string]: any } = {};
      guests.forEach(guestName => {
        if (guestName.trim()) {
          // Try to get existing response from context or initialize with default
          initialResponses[guestName] = getDefaultResponse();
        }
      });
      setResponses(initialResponses);
    }
  }, [guests, question]);

  const fetchQuestion = async (wwwId: string, questionId: string) => {
    try {
      setLoading(true);
      
      // Get all questions for this event to find the current one and next one
      const response = await fetch(`/api/invitation/custom-questions/${wwwId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const data = await response.json();
      const questions = data.questions || [];
      
      // Find current question
      const currentQuestion = questions.find((q: CustomQuestion) => q.id === questionId);
      
      if (!currentQuestion) {
        setError('Question not found');
        return;
      }

      if (!currentQuestion.is_active) {
        setError('This question is no longer active');
        return;
      }

      setQuestion(currentQuestion);

      // Find next question
      const sortedQuestions = questions.sort((a: CustomQuestion, b: CustomQuestion) => a.order_index - b.order_index);
      const currentIndex = sortedQuestions.findIndex((q: CustomQuestion) => q.id === questionId);
      const nextQuestion = sortedQuestions[currentIndex + 1];
      
      if (nextQuestion) {
        setNextQuestionId(nextQuestion.id);
      } else {
        // No more custom questions, go to note
        setNextQuestionId('note');
      }

    } catch (error) {
      console.error('Error fetching question:', error);
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultResponse = () => {
    if (!question) return '';
    
    switch (question.question_type) {
      case 'yes_no':
        return '';
      case 'multiple_choice':
        return question.options[0] || '';
      case 'text':
        return '';
      case 'attendance':
        return 'will';
      case 'food_preference':
        return question.options[0] || '';
      default:
        return '';
    }
  };

  const handleResponseChange = (guestName: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [guestName]: value
    }));
  };

  const handleContinue = () => {
    if (!question) return;

    // Validate required responses
    if (question.required) {
      const missingResponses = guests.filter(guestName => {
        const response = responses[guestName];
        return !response || (typeof response === 'string' && response.trim() === '');
      });

      if (missingResponses.length > 0) {
        alert('Please provide responses for all required fields.');
        return;
      }
    }

    // Save responses to context
    const customResponses = {
      ...state.customResponses,
      [question.id]: responses
    };

    dispatch({ type: 'SET_CUSTOM_RESPONSES', payload: customResponses });

    // Navigate to next step
    if (nextQuestionId === 'note') {
      router.push(`/event-id/${wwwId}/invitation/note`);
    } else {
      router.push(`/event-id/${wwwId}/invitation/custom-question/${nextQuestionId}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#fff] pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
        <div className="flex-1 flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5B574] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#fff] pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
        <div className="flex-1 flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">Question Not Available</h1>
            <p className="text-gray-600 mb-6">{error || 'This question could not be loaded.'}</p>
            <button
              onClick={handleBack}
              className="bg-[#E5B574] text-white px-6 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fff] pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">No guests found</h1>
          <p className="text-gray-600">Please go back and add guest information first.</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-[#08080A] text-white px-6 py-2 rounded-md hover:bg-[#C18037] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={true}
        rsvpEnabled={true}
        currentPage="rsvp"
      />
      <div className="min-h-screen flex flex-col justify-between bg-[#fff] pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
        <div className="flex flex-col items-center justify-center flex-1 py-12">
          <div className="relative w-full max-w-[900px] bg-white rounded-2xl border border-[#B7B7B7] p-0 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
            {/* Decorative Corners and Sparkles (inside card) */}
            <Image src="/images/invitation/leaf_left.png" alt="leaf left" width={180} height={180} className="absolute left-0 top-0 z-0" style={{ pointerEvents: 'none' }} />
            <Image src="/images/invitation/sparkle_left.png" alt="sparkle left" width={180} height={40} className="absolute left-5 top-0 z-0" style={{ pointerEvents: 'none' }} />
            <Image src="/images/invitation/leaf_right.png" alt="leaf right" width={180} height={180} className="absolute right-0 bottom-0 z-0" style={{ pointerEvents: 'none' }} />
            <Image src="/images/invitation/sparkle_right.png" alt="sparkle right" width={200} height={40} className="absolute right-5 bottom-10 z-0" style={{ pointerEvents: 'none' }} />

            {/* Main Content */}
            <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center mb-8 mt-2 z-10 px-16 pt-12 pb-8">
              <div className="text-center w-full mb-10">
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#E5B574', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                    {question.title}
                  </span>
                  {question.description && (
                    <span className="text-2xl md:text-3xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#08080A', letterSpacing: '0.5px', lineHeight: 1.1, fontStyle: 'italic', marginTop: '0.5rem' }}>
                      {question.description}
                    </span>
                  )}
                  <div className="w-24 h-[2px] bg-[#B7B7B7] mx-auto my-4" />
                </div>
              </div>

              {/* Guest Responses */}
              <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8 mb-12">
                {guests.map((guestName, idx) => (
                  <div key={guestName} className={`flex flex-col w-full items-${idx % 2 === 0 ? 'start' : 'end'}`}>
                    <div className={`text-sm md:text-base text-[#08080A] uppercase mb-2 ${idx % 2 === 0 ? '' : 'text-right'}`} style={{ fontFamily: 'Montserrat', letterSpacing: '0.5px' }}>
                      {guestName}
                    </div>
                    
                    {/* Question Type Rendering */}
                    {question.question_type === 'yes_no' && (
                      <div className={`flex flex-row gap-4 w-full ${idx % 2 === 0 ? '' : 'justify-end'}`}>
                        {['Yes', 'No'].map(option => (
                          <button
                            key={option}
                            className={`w-full py-3 rounded-md text-base transition-colors focus:outline-none ${responses[guestName] === option ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                            style={{ fontFamily: 'Montserrat', fontSize: '15px' }}
                            onClick={() => handleResponseChange(guestName, option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {question.question_type === 'multiple_choice' && (
                      <div className={`flex flex-col gap-2 w-full ${idx % 2 === 0 ? '' : 'items-end'}`}>
                        {question.options.map(option => (
                          <button
                            key={option}
                            className={`w-full py-3 rounded-md text-base transition-colors focus:outline-none ${responses[guestName] === option ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                            style={{ fontFamily: 'Montserrat', fontSize: '15px' }}
                            onClick={() => handleResponseChange(guestName, option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {question.question_type === 'text' && (
                      <div className={`w-full ${idx % 2 === 0 ? '' : 'flex justify-end'}`}>
                        <textarea
                          className="w-full p-3 border border-[#B7B7B7] rounded-md resize-none focus:outline-none focus:border-[#E5B574]"
                          rows={3}
                          placeholder="Your response..."
                          value={responses[guestName] || ''}
                          onChange={(e) => handleResponseChange(guestName, e.target.value)}
                          style={{ fontFamily: 'Montserrat', fontSize: '15px' }}
                        />
                      </div>
                    )}

                    {question.question_type === 'attendance' && (
                      <div className={`flex flex-row gap-4 w-full ${idx % 2 === 0 ? '' : 'justify-end'}`}>
                        {[
                          { value: 'will', label: 'Will Attend' },
                          { value: 'cant', label: "Can't Attend" }
                        ].map(option => (
                          <button
                            key={option.value}
                            className={`w-full py-3 rounded-md text-base transition-colors focus:outline-none ${responses[guestName] === option.value ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                            style={{ fontFamily: 'Montserrat', fontSize: '15px' }}
                            onClick={() => handleResponseChange(guestName, option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {question.question_type === 'food_preference' && (
                      <div className={`flex flex-col gap-2 w-full ${idx % 2 === 0 ? '' : 'items-end'}`}>
                        {question.options.map(option => (
                          <button
                            key={option}
                            className={`w-full py-3 rounded-md text-base transition-colors focus:outline-none ${responses[guestName] === option ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                            style={{ fontFamily: 'Montserrat', fontSize: '15px' }}
                            onClick={() => handleResponseChange(guestName, option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <button
                className="w-full max-w-md bg-[#08080A] text-white py-5 rounded-md font-semibold text-lg mt-8 hover:bg-[#222] transition-colors focus:outline-none"
                style={{ fontFamily: 'Montserrat', marginTop: '5rem'}}
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}