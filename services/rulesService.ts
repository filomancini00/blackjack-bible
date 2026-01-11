import { Card, Rank, ActionType, AIAdvice } from '../types';

interface HandValue {
    total: number;
    isSoft: boolean;
    isPair: boolean;
    canSplit: boolean;
}

const getCardValue = (rank: Rank): number => {
    if (rank === Rank.ACE) return 11;
    if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(rank)) return 10;
    return parseInt(rank);
};

const calculateHand = (cards: Card[]): HandValue => {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
        const val = getCardValue(card.rank);
        total += val;
        if (card.rank === Rank.ACE) aces += 1;
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }

    const isPair = cards.length === 2 && getCardValue(cards[0].rank) === getCardValue(cards[1].rank);
    // Careful: 10-J is a pair of 10s value-wise, but usually split rules apply to Rank equality. 
    // Standard strategy usually refers to Rank pairs (e.g. 5,5 or 8,8). 
    // However, "10,10" row in table implies value 10 cards. Let's assume Rank equality for splitting usually.
    // But the table says "10,10" which covers 10-K, J-Q etc.
    // Let's stick to strict rank equality for splitting for now, unless it's 10-value.
    const isStrictPair = cards.length === 2 && cards[0].rank === cards[1].rank;

    const isSoft = aces > 0 && total <= 21; // Actually implies we are using an Ace as 11.
    // If we have A, 9 -> Total 20 (Soft 20). If we have A, A, 9 -> Total 21 (Hard 21? No, 1+1+9=11... wait. A(11)+A(1)+9 = 21. Soft 21).
    // A hand is soft if it has an Ace that is counted as 11.
    // Our loop deducts 10 for every Ace if total > 21. So if aces > 0 after the loop, it means we have at least one Ace counted as 11.

    return { total, isSoft: aces > 0, isPair: isStrictPair, canSplit: isStrictPair };
};

const getDealerValue = (card: Card): number => {
    const val = getCardValue(card.rank);
    // Ace is 11, but for column lookup usually we treat Ace as 'A'
    return val;
};

// C=HIT, S=STAND, DD=DOUBLE, Sp=SPLIT
// We'll map these to ActionType
const mapCodeToAction = (code: string): ActionType => {
    switch (code) {
        case 'C': return ActionType.HIT;
        case 'S': return ActionType.STAND;
        case 'DD': return ActionType.DOUBLE;
        case 'Sp': return ActionType.SPLIT;
        default: return ActionType.STAND; // Fallback
    }
};

// Basic heuristic for Win Probability based on Player Hand vs Dealer Upcard or Hand Strength
const getWinProbability = (hand: HandValue, dealerVal: number): number => {
    const t = hand.total;

    // Blackjack (Natural) or 21
    if (t === 21) return 100; // Virtually guaranteed win/push (unless dealer blackjack)

    // Strong Hands
    if (t === 20) return 92; // Very high win rate
    if (t === 19) return 85;

    // Good Hands (18)
    if (t === 18) {
        // Strong vs weak dealer, weak vs strong dealer
        if (dealerVal >= 2 && dealerVal <= 6) return 70; // Dealer likely to bust or get < 18
        if (dealerVal === 7) return 60; // Push or Win likely
        if (dealerVal === 8) return 45; // Coin flip, slightly disadvantage
        return 40; // vs 9, 10, A (losing)
    }

    // Unsteady Hands (17)
    if (t === 17) {
        if (dealerVal >= 2 && dealerVal <= 6) return 65; // Hoping for bust
        return 25; // Likely loss vs 7+ (which usually stand on 17+)
    }

    // Bust Risks (12-16) - "Stiffs"
    if (t >= 12 && t <= 16) {
        if (dealerVal >= 4 && dealerVal <= 6) return 45; // Dealer bust chance is high (~40%)
        return 30; // Very disadvantageous, need a hit or bust hope
    }

    // Double Down Opportunities (9, 10, 11) - BEFORE the extra card!
    // But here we are evaluating the *current* hand strength.
    // If we have 11, we have a great shot at 21. Win prob is high.
    if (t === 11) return 70; // High expected value
    if (t === 10) return 65;
    if (t === 9) return 55; // Decent

    // Low hands
    return 40; // Anything else is just building
};

export const getBasicStrategyAdvice = async (dealerCard: Card, playerCards: Card[]): Promise<AIAdvice> => {
    // Artificial delay to simulate "thinking" (optional, remove if want instant)
    // await new Promise(resolve => setTimeout(resolve, 600));

    const hand = calculateHand(playerCards);
    const dealerVal = getDealerValue(dealerCard); // 2-11 (11 is Ace)

    let actionCode = 'S'; // Default

    // Check for Busted state first
    if (hand.total > 21) {
        return {
            action: ActionType.BUST,
            confidence: 100,
            winProbability: 0,
            explanation: `You currently have ${hand.total}. You have busted.`
        };
    }
    let rulesDescription = '';

    // Dealer Column Key: 2,3,4,5,6,7,8,9,10,11(A)
    const d = dealerVal;

    // --- PAIRS ---
    if (hand.isPair && playerCards.length === 2) {
        const pairRank = playerCards[0].rank;
        const pairVal = getCardValue(pairRank); // 2-11

        // Lookup based on Pair Rank (2,2 through A,A)
        // Table Rows:
        if (pairRank === Rank.TWO || pairRank === Rank.THREE) { // 2,2 & 3,3 (Value 2 & 3? No, Rank 2 & 3)
            // 2,2: C C Sp Sp Sp Sp C C C C
            // 3,3: C C Sp Sp Sp Sp C C C C
            if ([4, 5, 6, 7].includes(d)) actionCode = 'Sp';
            else actionCode = 'C';
            rulesDescription = "Split 2s and 3s against Dealer 4-7.";
        } else if (pairRank === Rank.FOUR) { // 4,4
            // C C C C C C C C C C  -> Always Hit (User chart says C everywhere)
            actionCode = 'C';
            rulesDescription = "Never split 4s (per this chart).";
        } else if (pairRank === Rank.FIVE) { // 5,5 (Total 10)
            // DD DD DD DD DD DD DD DD C C
            // Double 2-9. Hit 10-A. (Chart says DD until 9, then C).
            if (d >= 2 && d <= 9) actionCode = 'DD';
            else actionCode = 'C';
            rulesDescription = "Double 5s against Dealer 2-9.";
        } else if (pairRank === Rank.SIX) { // 6,6
            // C Sp Sp Sp Sp C C C C C
            // Split 3-6.
            if ([3, 4, 5, 6].includes(d)) actionCode = 'Sp';
            else actionCode = 'C';
            rulesDescription = "Split 6s against Dealer 3-6.";
        } else if (pairRank === Rank.SEVEN) { // 7,7
            // Sp Sp Sp Sp Sp Sp C C C C
            // Split 2-7.
            if (d >= 2 && d <= 7) actionCode = 'Sp';
            else actionCode = 'C';
            rulesDescription = "Split 7s against Dealer 2-7.";
        } else if (pairRank === Rank.EIGHT) { // 8,8
            // Sp Sp Sp Sp Sp Sp Sp Sp C C
            // Split 2-9.
            if (d >= 2 && d <= 9) actionCode = 'Sp';
            else actionCode = 'C';
            rulesDescription = "Always split 8s (unless Dealer has 10 or Ace).";
        } else if (pairRank === Rank.NINE) { // 9,9
            // Sp Sp Sp Sp Sp S Sp Sp S S
            // Split 2-6, 8-9. Stand 7, 10, A.
            if (d === 7 || d === 10 || d === 11) actionCode = 'S';
            else actionCode = 'Sp';
            rulesDescription = "Split 9s against 2-6 and 8-9. Stand on 7.";
        } else if (getCardValue(pairRank) === 10) { // 10,10
            // S S S S S S S S S S -> Always Stand
            actionCode = 'S';
            rulesDescription = "Never split 10s.";
        } else if (pairRank === Rank.ACE) { // A,A
            // Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp -> Always Split
            actionCode = 'Sp';
            rulesDescription = "Always split Aces.";
        }
    }
    // --- SOFT TOTALS (A,X) ---
    else if (hand.isSoft) {
        // We have a soft total. Values 13-21 (A,2 = 13 ... A,K = 21)
        const total = hand.total;

        if (total >= 19) { // A,8 (19) or A,9 (20) -> Chart says S S S S ...
            // A,8: S S S S S S S S S S (Row 19)
            // A,9: S S S S S S S S S S (Row 20)
            actionCode = 'S';
            rulesDescription = "Stand on Soft 19 and 20.";
        } else if (total === 18) { // A,7
            // S DD DD DD DD S S C C C
            // Double 3-6. Stand 2,7,8. Hit 9,10,A.
            if (d >= 3 && d <= 6) actionCode = 'DD';
            else if (d === 2 || d === 7 || d === 8) actionCode = 'S';
            else actionCode = 'C';
            rulesDescription = "Soft 18: Double vs 3-6, Stand vs 2,7,8, Hit vs 9+.";
        } else if (total === 17) { // A,6
            // C DD DD DD DD C C C C C
            // Double 3-6. Hit else.
            if (d >= 3 && d <= 6) actionCode = 'DD';
            else actionCode = 'C';
            rulesDescription = "Soft 17: Double vs 3-6.";
        } else if (total === 16 || total === 15) { // A,5 & A,4
            // C C DD DD DD C C C C C
            // Double 4-6. Hit else.
            if (d >= 4 && d <= 6) actionCode = 'DD';
            else actionCode = 'C';
            rulesDescription = `Soft ${total}: Double vs 4-6.`;
        } else if (total === 14 || total === 13) { // A,3 & A,2
            // C C C DD DD C C C C C
            // Double 5-6. Hit else.
            // Wait, Chart says:
            // A,3: C C C DD DD C C C C C (Double 5-6)
            // A,2: C C C C DD C C C C C (Double 6 only!) -- CHECK TABLE CAREFULLY --
            // Looking at snippet: 
            // G=A,2 (13): C C C C DD C... (Col 6 is DD) -> Double 6.
            // G=A,3 (14): C C C DD DD C... (Col 5,6 is DD) -> Double 5,6.
            if (total === 13) {
                if (d === 6) actionCode = 'DD';
                else actionCode = 'C';
                rulesDescription = "Soft 13: Double vs 6 only.";
            } else { // 14
                if (d === 5 || d === 6) actionCode = 'DD';
                else actionCode = 'C';
                rulesDescription = "Soft 14: Double vs 5-6.";
            }
        }
    }
    // --- HARD TOTALS ---
    else {
        const t = hand.total;
        if (t >= 17) { // 17+
            // S S S S S S S S S S
            actionCode = 'S';
            rulesDescription = "Stand on Hard 17+.";
        } else if (t >= 13 && t <= 16) { // 13, 14, 15, 16
            // 13-16: S S S S S C C C C C (Stand 2-6, Hit 7+)
            // EXCEPTIONS in Chart?
            // G=12: C C S S S C C C C C (Check 12 separately)
            // G=13-16: All S until 6, then C.
            if (d >= 2 && d <= 6) actionCode = 'S';
            else actionCode = 'C';
            rulesDescription = `Hard ${t}: Stand vs 2-6, Hit vs 7+.`;
        } else if (t === 12) {
            // C C S S S C C C C C
            // Stand 4-6. Hit else.
            if (d >= 4 && d <= 6) actionCode = 'S';
            else actionCode = 'C';
            rulesDescription = "Hard 12: Stand vs 4-6, else Hit.";
        } else if (t === 11) {
            // DD DD DD DD DD DD DD DD DD C
            // Double 2-10 (Check chart: B=10 is DD). B=A is C.
            if (d <= 10) actionCode = 'DD';
            else actionCode = 'C';
            rulesDescription = "Always Double 11 (except vs Ace).";
        } else if (t === 10) {
            // DD DD DD DD DD DD DD DD C C 
            // Double 2-9. Hit 10, A.
            if (d >= 2 && d <= 9) actionCode = 'DD';
            else actionCode = 'C';
            rulesDescription = "Double 10 vs 2-9.";
        } else if (t === 9) {
            // C DD DD DD DD C C C C C
            // Double 3-6. Hit else.
            if (d >= 3 && d <= 6) actionCode = 'DD';
            else actionCode = 'C';
            rulesDescription = "Double 9 vs 3-6.";
        } else { // 8 or less
            // C C C C C C...
            actionCode = 'C';
            rulesDescription = "Always Hit hard 8 or less.";
        }
    }

    // Logic for "DD" or "Sp" if not allowed (e.g. 3+ cards)?
    // Basic Strategy charts technically apply to first 2 cards for Split/Double.
    // If we have 3 cards, we can't Init Double or Split usually.
    // The "Action" enum has Double/Split. The UI handles simple display.
    // A simplified approach: If user has > 2 cards, degrade DD to Hit/Stand relative to logic (usually Hit) and Sp is impossible.
    // For this strict implementation, let's output the Ideal move, but maybe add a note or fallback if physical constraint?
    // Let's stick to the chart output for "Statistically Optimal", even if impossible (User can deduce).
    // OR: If > 2 cards, map DD -> Hit (if usually beneficial) or Stand.
    // Standard rule: If you can't double, you Hit (for soft 13-18 and hard 9-11).
    // Exception: Soft 18 vs 3-6 (Doubling) -> If >2 cards, we usually Stand on Soft 18 vs small cards?
    // Actually, Soft 18 (A,2,5) vs 6: You have 18 vs 6. You likely Stand.
    // But Hard 11 (3,3,5) vs 6: You Hit.

    // REFINEMENT: If playerCards.length > 2:
    if (playerCards.length > 2) {
        if (actionCode === 'Sp') actionCode = 'C'; // Can't split.
        if (actionCode === 'DD') {
            // Logic to fallback:
            // Hard 9, 10, 11 -> HIT.
            // Soft 13-17 -> HIT.
            // Soft 18 -> STAND (usually).
            if (hand.isSoft && hand.total === 18) actionCode = 'S';
            else actionCode = 'C';
        }
    }

    const action = mapCodeToAction(actionCode);
    const winProbability = getWinProbability(hand, d);

    return {
        action,
        confidence: 100,
        winProbability,
        explanation: `${rulesDescription} (Table Rule: Player ${hand.isSoft ? 'Soft' : ''} ${hand.total} vs Dealer ${d})`
    };
};
