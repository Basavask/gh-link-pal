import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Flashcard, SpacedRepetitionData } from '@/types';

interface UseSpacedRepetitionReturn {
  dueFlashcards: Flashcard[];
  reviewFlashcard: (flashcardId: string, quality: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// SM-2 Spaced Repetition Algorithm
const calculateNextReview = (
  currentData: SpacedRepetitionData,
  quality: number
): SpacedRepetitionData => {
  let { interval, repetitions, ease_factor } = currentData;

  // Calculate new ease factor
  const newEaseFactor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const clampedEaseFactor = Math.max(1.3, newEaseFactor);

  // Calculate new interval
  let newInterval: number;
  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * clampedEaseFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response - reset
    newInterval = 1;
    repetitions = 0;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitions,
    ease_factor: clampedEaseFactor,
    quality,
    due_date: nextReview.toISOString()
  };
};

export const useSpacedRepetition = (): UseSpacedRepetitionReturn => {
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch due flashcards
  const fetchDueFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Get due flashcards using the database function
      const { data, error: fetchError } = await supabase
        .rpc('get_due_flashcards', { p_user_id: user.id });

      if (fetchError) {
        console.error('Error fetching due flashcards:', fetchError);
        setError('Failed to fetch flashcards');
        return;
      }

      setDueFlashcards(data || []);
    } catch (err) {
      console.error('Error in fetchDueFlashcards:', err);
      setError('Failed to fetch flashcards');
    } finally {
      setLoading(false);
    }
  };

  // Review a flashcard
  const reviewFlashcard = async (flashcardId: string, quality: number) => {
    try {
      setError(null);

      // Get current flashcard data
      const { data: flashcard, error: fetchError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', flashcardId)
        .single();

      if (fetchError || !flashcard) {
        throw new Error('Flashcard not found');
      }

      // Calculate new spaced repetition data
      const currentData = flashcard.repetition_data as SpacedRepetitionData;
      const newData = calculateNextReview(currentData, quality);

      // Update flashcard in database
      const { error: updateError } = await supabase
        .from('flashcards')
        .update({
          repetition_data: newData,
          last_reviewed: new Date().toISOString(),
          next_review: newData.due_date
        })
        .eq('id', flashcardId);

      if (updateError) {
        throw new Error('Failed to update flashcard');
      }

      // Update progress
      await updateProgress(flashcard.document_id, quality);

      // Refresh due flashcards
      await fetchDueFlashcards();

    } catch (err: any) {
      console.error('Error reviewing flashcard:', err);
      setError(err.message || 'Failed to review flashcard');
    }
  };

  // Update user progress
  const updateProgress = async (documentId: string, quality: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current progress
      const { data: progress } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('document_id', documentId)
        .single();

      const flashcardsReviewed = (progress?.flashcards_reviewed || 0) + 1;
      const retentionRate = quality >= 3 ? 100 : 0; // Simple retention calculation

      if (progress) {
        // Update existing progress
        await supabase
          .from('progress')
          .update({
            flashcards_reviewed: flashcardsReviewed,
            retention_rate: retentionRate,
            last_studied: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', progress.id);
      } else {
        // Create new progress record
        await supabase
          .from('progress')
          .insert({
            user_id: user.id,
            document_id: documentId,
            flashcards_reviewed: flashcardsReviewed,
            retention_rate: retentionRate,
            study_time: 0,
            notes_reviewed: 0,
            last_studied: new Date().toISOString()
          });
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  // Load due flashcards on mount
  useEffect(() => {
    fetchDueFlashcards();
  }, []);

  return {
    dueFlashcards,
    reviewFlashcard,
    loading,
    error
  };
};

// Utility functions for spaced repetition
export const getQualityDescription = (quality: number): string => {
  switch (quality) {
    case 0:
      return "Complete blackout";
    case 1:
      return "Incorrect response";
    case 2:
      return "Hard to recall";
    case 3:
      return "Correct response";
    case 4:
      return "Perfect response";
    case 5:
      return "Easy to recall";
    default:
      return "Unknown";
  }
};

export const getNextReviewText = (nextReview: string): string => {
  const now = new Date();
  const reviewDate = new Date(nextReview);
  const diffTime = reviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Overdue";
  } else if (diffDays === 0) {
    return "Due today";
  } else if (diffDays === 1) {
    return "Due tomorrow";
  } else if (diffDays < 7) {
    return `Due in ${diffDays} days`;
  } else if (diffDays < 30) {
    const weeks = Math.ceil(diffDays / 7);
    return `Due in ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else {
    const months = Math.ceil(diffDays / 30);
    return `Due in ${months} month${months > 1 ? 's' : ''}`;
  }
};

export const isFlashcardDue = (nextReview: string): boolean => {
  const now = new Date();
  const reviewDate = new Date(nextReview);
  return reviewDate <= now;
}; 