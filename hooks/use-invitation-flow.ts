import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomQuestion, getInvitationFlow, getNextStep, getPreviousStep } from '@/lib/invitation-flow';

export function useInvitationFlow(wwwId: string) {
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCustomQuestions();
  }, [wwwId]);

  const fetchCustomQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invitation/custom-questions/${wwwId}`);
      
      if (!response.ok) {
        console.warn('Failed to fetch custom questions, continuing with empty array');
        setCustomQuestions([]);
        return;
      }

      const data = await response.json();
      setCustomQuestions(data.questions || []);
    } catch (error) {
      console.warn('Error fetching custom questions, continuing with empty array:', error);
      setCustomQuestions([]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const getFlow = () => {
    return getInvitationFlow(customQuestions, wwwId);
  };

  const navigateToNextStep = (currentStepId: string) => {
    console.log('DEBUG: navigateToNextStep called with:', currentStepId);
    console.log('DEBUG: wwwId:', wwwId);
    console.log('DEBUG: customQuestions:', customQuestions);
    
    const nextStepPath = getNextStep(currentStepId, customQuestions, wwwId);
    console.log('DEBUG: nextStepPath:', nextStepPath);
    
    if (nextStepPath) {
      console.log('DEBUG: Navigating to:', nextStepPath);
      router.push(nextStepPath); // Path already includes /event-id/${wwwId}
    } else {
      console.error('DEBUG: No next step found!');
    }
  };

  const navigateToPreviousStep = (currentStepId: string) => {
    const previousStepPath = getPreviousStep(currentStepId, customQuestions, wwwId);
    if (previousStepPath) {
      router.push(previousStepPath); // Path already includes /event-id/${wwwId}
    }
  };

  return {
    customQuestions,
    loading,
    error,
    getFlow,
    navigateToNextStep,
    navigateToPreviousStep,
    refetch: fetchCustomQuestions
  };
}
