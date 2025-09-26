// Helper functions for managing the invitation flow with custom questions

export interface CustomQuestion {
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

export interface InvitationStep {
  id: string;
  type: 'default' | 'custom';
  orderIndex: number;
  path: string;
  title: string;
}

// Default invitation steps
const DEFAULT_STEPS: InvitationStep[] = [
  { id: 'guests', type: 'default', orderIndex: 0, path: '/invitation', title: 'Add Guests' },
  { id: 'attendance', type: 'default', orderIndex: 1, path: '/invitation/attendance', title: 'Wedding Day Attendance' },
  { id: 'after-party', type: 'default', orderIndex: 2, path: '/invitation/after-party', title: 'After Party' },
  { id: 'food-selection', type: 'default', orderIndex: 3, path: '/invitation/food-selection', title: 'Food Selection' },
  { id: 'accommodation', type: 'default', orderIndex: 4, path: '/invitation/accommodation', title: 'Accommodation' },
  { id: 'transportation', type: 'default', orderIndex: 5, path: '/invitation/transportation', title: 'Transportation' },
  { id: 'note', type: 'default', orderIndex: 6, path: '/invitation/note', title: 'Send a Note' },
  { id: 'confirmation', type: 'default', orderIndex: 7, path: '/invitation/confirmation', title: 'Confirmation' }
];

/**
 * Gets the complete invitation flow for an event including custom questions
 */
export function getInvitationFlow(customQuestions: CustomQuestion[], wwwId: string): InvitationStep[] {
  // Convert custom questions to steps and place them between transportation (index 5) and note (index 6)
  const customSteps: InvitationStep[] = customQuestions.map(question => ({
    id: question.id,
    type: 'custom',
    orderIndex: 5.5 + (question.order_index * 0.1), // Place between transportation (5) and note (6)
    path: `/event-id/${wwwId}/invitation/custom-question/${question.id}`,
    title: question.title
  }));

  // Update default steps to use event-id paths (remove the leading /invitation from step.path)
  const updatedDefaultSteps: InvitationStep[] = DEFAULT_STEPS.map(step => ({
    ...step,
    path: step.path === '/invitation' 
      ? `/event-id/${wwwId}/invitation` 
      : `/event-id/${wwwId}${step.path}`
  }));

  // Combine and sort all steps
  const allSteps = [...updatedDefaultSteps, ...customSteps];
  return allSteps.sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * Gets the next step in the invitation flow
 */
export function getNextStep(currentStepId: string, customQuestions: CustomQuestion[], wwwId: string): string | null {
  console.log('DEBUG: getNextStep called with:', { currentStepId, customQuestions, wwwId });
  
  const flow = getInvitationFlow(customQuestions, wwwId);
  console.log('DEBUG: Complete flow:', flow);
  
  const currentIndex = flow.findIndex(step => step.id === currentStepId);
  console.log('DEBUG: Current step index:', currentIndex);
  
  if (currentIndex === -1 || currentIndex === flow.length - 1) {
    console.log('DEBUG: No next step found (currentIndex:', currentIndex, ', flow.length:', flow.length, ')');
    return null; // No next step
  }
  
  const nextStep = flow[currentIndex + 1];
  console.log('DEBUG: Next step:', nextStep);
  return nextStep.path;
}

/**
 * Gets the previous step in the invitation flow
 */
export function getPreviousStep(currentStepId: string, customQuestions: CustomQuestion[], wwwId: string): string | null {
  const flow = getInvitationFlow(customQuestions, wwwId);
  const currentIndex = flow.findIndex(step => step.id === currentStepId);
  
  if (currentIndex <= 0) {
    return null; // No previous step
  }
  
  const previousStep = flow[currentIndex - 1];
  return previousStep.path;
}

/**
 * Checks if a step is the last step in the flow
 */
export function isLastStep(stepId: string, customQuestions: CustomQuestion[], wwwId: string): boolean {
  const flow = getInvitationFlow(customQuestions, wwwId);
  return flow[flow.length - 1].id === stepId;
}

/**
 * Gets the step index (for progress tracking)
 */
export function getStepIndex(stepId: string, customQuestions: CustomQuestion[], wwwId: string): number {
  const flow = getInvitationFlow(customQuestions, wwwId);
  return flow.findIndex(step => step.id === stepId);
}

/**
 * Gets the total number of steps
 */
export function getTotalSteps(customQuestions: CustomQuestion[], wwwId: string): number {
  const flow = getInvitationFlow(customQuestions, wwwId);
  return flow.length;
}
