import { AvaInsights, CardStatus } from '../../shared/types';
import { dataService } from '../../shared/data/dataService';

// Ava insights calculated as specified
export class AvaService {
  
  calculateInsights(weekId: string): AvaInsights {
    const week = dataService.getWeekById(weekId);
    if (!week) {
      throw new Error(`Week with id ${weekId} not found`);
    }

    const cards = dataService.getCardsByWeekId(weekId);
    const sessions = dataService.getSessionsByWeekRange(week.userId, week.startISO);

    //Calculate total minutes from cards
    const totalMinutes = cards.reduce((sum, card) => sum + card.minutes, 0);

    // Count done card
    const doneCount = cards.filter(card => card.status === CardStatus.DONE).length;

    // Calculate total sesion minutes
    const totalSessionMinutes = sessions.reduce((sum, session) => {
      const start = new Date(session.startedAt);
      const end = new Date(session.endedAt);
      const durationMs = end.getTime() - start.getTime();
      return sum + Math.floor(durationMs / (1000 * 60)); // convert to minutes
    }, 0);

    // Focus score as rquerid:
    // min(100, round((doneCount * 10) + (totalSessionMinutes/60 * 5)))
    const focusScore = Math.min(100, Math.round((doneCount * 10) + (totalSessionMinutes / 60 * 5)));

    // Generate recommendations
    const recommendations = this.generateRecommendations(cards, sessions, focusScore);

    return {
      totalMinutes,
      doneCount,
      focusScore,
      recommendations
    };
  }

  private generateRecommendations(cards: any[], sessions: any[], focusScore: number): string[] {
    const recommendations: string[] = [];

    // 1. Low focus score
    if (focusScore < 30) {
      recommendations.push("Consider breaking down large tasks into smaller, manageable chunks");
    }

    // 2. Many TODO cards
    const todoCount = cards.filter(card => card.status === CardStatus.TODO).length;
    if (todoCount > 3) {
      recommendations.push("You have many pending tasks. Try to prioritize and focus on 2-3 key items");
    }

    // 3. No sessions
    if (sessions.length === 0) {
      recommendations.push("Start tracking your work sessions to get better insights");
    }

    // 4. High focus score
    if (focusScore >= 80) {
      recommendations.push("Great work! You're maintaining excellent focus and productivity");
    }

    //5. Cards with zero minutes
    const zeroMinuteCards = cards.filter(card => card.minutes === 0).length;
    if (zeroMinuteCards > 0) {
      recommendations.push("Consider estimating time for your tasks to improve planning");
    }

    // else
    if (recommendations.length === 0) {
      recommendations.push("Keep up the good work! Stay consistent with your task management");
    }

    return recommendations;
  }
}

export const avaService = new AvaService();

