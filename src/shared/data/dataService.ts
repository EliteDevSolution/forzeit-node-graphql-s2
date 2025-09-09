import * as fs from 'fs';
import * as path from 'path';
import { User, Week, Card, Session, CardStatus } from '../types';

// in-memory data service instead proper database layer for this demo
export class DataService {
  private data!: {
    users: User[];
    weeks: Week[];
    cards: Card[];
    sessions: Session[];
  };

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const seedPath = path.join(__dirname, '../../data/seed.json');
      const rawData = fs.readFileSync(seedPath, 'utf8');
      this.data = JSON.parse(rawData);
      
      // TODO: add some validation here maybe?
      console.log('Data loaded successfully:', {
        users: this.data.users.length,
        weeks: this.data.weeks.length,
        cards: this.data.cards.length,
        sessions: this.data.sessions.length
      });
    } catch (error) {
      console.error('Failed to load seed data:', error);
      // fallback to empty data
      this.data = { users: [], weeks: [], cards: [], sessions: [] };
    }
  }

  // User operations
  getUserById(id: string): User | undefined {
    return this.data.users.find(user => user.id === id);
  }

  // Week operations
  getWeekById(id: string): Week | undefined {
    return this.data.weeks.find(week => week.id === id);
  }

  getWeeksByUserId(userId: string, limit?: number, offset?: number): Week[] {
    let weeks = this.data.weeks.filter(week => week.userId === userId);
    
    // sort by startISO descending (newest first)
    weeks.sort((a, b) => b.startISO.localeCompare(a.startISO));
    
    if (offset) {
      weeks = weeks.slice(offset);
    }
    
    if (limit) {
      weeks = weeks.slice(0, limit);
    }
    
    return weeks;
  }

  // Card operations
  getCardById(id: string): Card | undefined {
    return this.data.cards.find(card => card.id === id);
  }

  getCardsByWeekId(weekId: string): Card[] {
    return this.data.cards.filter(card => card.weekId === weekId);
  }

  createCard(weekId: string, title: string, minutes: number, userId: string): Card {
    // Generate a simple ID demo purpose only
    const newId = `c${this.data.cards.length + 1}`;
    
    const newCard: Card = {
      id: newId,
      userId,
      weekId,
      title,
      status: CardStatus.TODO, // new cards
      minutes,
      createdAt: new Date().toISOString()
    };

    this.data.cards.push(newCard);
    return newCard;
  }

  updateCardStatus(cardId: string, status: CardStatus): Card | null {
    const card = this.getCardById(cardId);
    if (!card) {
      return null;
    }

    // Update the status
    card.status = status;
    return card;
  }

  // Session operations
  getSessionsByUserId(userId: string): Session[] {
    return this.data.sessions.filter(session => session.userId === userId);
  }

  getSessionsByWeekRange(userId: string, weekStart: string): Session[] {
    // Get sessions that fall within the week needed timezones properly
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    return this.data.sessions.filter(session => {
      if (session.userId !== userId) return false;
      
      const sessionDate = new Date(session.startedAt);
      return sessionDate >= weekStartDate && sessionDate < weekEndDate;
    });
  }
}

// Singleton instance
export const dataService = new DataService();

