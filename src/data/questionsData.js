import { GRAMMAR_QUESTIONS_PART_1 } from './grammarQuestionsPart1.js';
import { GRAMMAR_QUESTIONS_PART_2 } from './grammarQuestionsPart2.js';
import { CLOZE_PASSAGES_PART_1 } from './clozePassagesPart1.js';
import { CLOZE_PASSAGES_PART_2 } from './clozePassagesPart2.js';

export const GRAMMAR_QUESTIONS = [
  ...GRAMMAR_QUESTIONS_PART_1,
  ...GRAMMAR_QUESTIONS_PART_2,
];

export const CLOZE_PASSAGES = [
  ...CLOZE_PASSAGES_PART_1,
  ...CLOZE_PASSAGES_PART_2,
];

export const CLOZE_QUESTIONS = CLOZE_PASSAGES.flatMap((passage) =>
  passage.questions.map((q) => ({
    ...q,
    passageText: passage.text,
    passageTranslationTR: passage.translationTR,
    passageTheme: passage.theme,
    passageNumber: passage.passageNumber,
  }))
);

export const ALL_QUESTIONS = [
  ...GRAMMAR_QUESTIONS,
  ...CLOZE_QUESTIONS,
];

export const GRAMMAR_TOPICS = [
  {
    id: "Tenses & Time Adverbials",
    label: "Tenses & Time Adverbials",
    shortLabel: "Tenses",
    count: 8,
    description: "Sequence of tenses, Future/Past Perfect Continuous, time clauses"
  },
  {
    id: "Modals & Semi-Modals",
    label: "Modals & Semi-Modals",
    shortLabel: "Modals",
    count: 6,
    description: "Past deductions, unfulfilled expectations, modal perfects"
  },
  {
    id: "Passives, Causatives & Participial Reductions",
    label: "Passives, Causatives & Participial Reductions",
    shortLabel: "Passives & Reductions",
    count: 8,
    description: "Perfect passive infinitives/gerunds, causatives, participle clauses"
  },
  {
    id: "Conjunctions, Transitions & Adverbial Clauses",
    label: "Conjunctions, Transitions & Adverbial Clauses",
    shortLabel: "Conjunctions",
    count: 10,
    description: "Concessive, causal, restrictive, and correlative connectors"
  },
  {
    id: "Relative & Noun Clauses",
    label: "Relative & Noun Clauses",
    shortLabel: "Relative & Noun Clauses",
    count: 6,
    description: "Quantifier relatives, prepositional relatives, nominal clauses"
  },
  {
    id: "Prepositions & Phrasal Verbs",
    label: "Prepositions & Phrasal Verbs",
    shortLabel: "Prepositions & Phrasals",
    count: 6,
    description: "C1/C2 academic collocations, idiomatic prepositions, phrasal verbs"
  },
  {
    id: "Inversion & Conditionals",
    label: "Inversion & Conditionals",
    shortLabel: "Inversion & Conditionals",
    count: 6,
    description: "Negative adverbial inversion, inverted & mixed conditionals"
  }
];

export const CLOZE_BLANK_TYPES = {
  1: "Vocabulary / Phrasal Verb",
  2: "Tense / Voice",
  3: "Preposition",
  4: "Conjunction / Connector",
  5: "Pronoun / Quantifier / Relative"
};

export const QUESTION_BANK_SUMMARY = {
  totalQuestions: ALL_QUESTIONS.length,
  grammarCount: GRAMMAR_QUESTIONS.length,
  clozePassagesCount: CLOZE_PASSAGES.length,
  clozeQuestionsCount: CLOZE_QUESTIONS.length,
  examStandard: "ÖSYM YDT / YDS (C1–C2 Academic)",
};

export default {
  GRAMMAR_QUESTIONS,
  CLOZE_PASSAGES,
  CLOZE_QUESTIONS,
  ALL_QUESTIONS,
  GRAMMAR_TOPICS,
  CLOZE_BLANK_TYPES,
  QUESTION_BANK_SUMMARY,
};
