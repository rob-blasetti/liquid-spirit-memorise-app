import React from 'react';
import WordRacerGame from '../games/WordRacerGame';
import { gameIds } from '../games';
import { achievements } from '../data/achievements';

describe('WordRacerGame', () => {
  it('exports a component', () => {
    expect(typeof WordRacerGame).toBe('function');
  });

  it('is registered in game ids', () => {
    expect(gameIds).toContain('wordRacerGame');
  });

  it('has achievements defined', () => {
    const ids = achievements.map((a) => a.id);
    expect(ids).toEqual(
      expect.arrayContaining(['wordRacer1', 'wordRacer2', 'wordRacer3']),
    );
  });
});
