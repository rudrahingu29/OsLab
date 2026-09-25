import React, { useState } from 'react';
import { Modal, Button, Input, Select, Textarea } from '../../../components/common';
import type { AdminQuestion, QuestionDifficulty } from '../types';

interface AdminAddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (q: Omit<AdminQuestion, 'id' | 'successRate'>) => void;
  topicSlug: string;
  topicName: string;
}

export const AdminAddQuestionModal: React.FC<AdminAddQuestionModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion,
  topicSlug,
  topicName,
}) => {
  const [question, setQuestion] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !opt0.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim()) return;

    onAddQuestion({
      topicSlug,
      topicName,
      question: question.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
      correctAnswer,
      explanation: explanation.trim() || 'No explanation provided.',
      difficulty,
    });

    setQuestion('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setExplanation('');
    setCorrectAnswer(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Question: ${topicName}`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
        <Textarea
          label="Question Prompt"
          placeholder="Enter question text here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Option A"
            value={opt0}
            onChange={(e) => setOpt0(e.target.value)}
            placeholder="Option 1"
            required
          />
          <Input
            label="Option B"
            value={opt1}
            onChange={(e) => setOpt1(e.target.value)}
            placeholder="Option 2"
            required
          />
          <Input
            label="Option C"
            value={opt2}
            onChange={(e) => setOpt2(e.target.value)}
            placeholder="Option 3"
            required
          />
          <Input
            label="Option D"
            value={opt3}
            onChange={(e) => setOpt3(e.target.value)}
            placeholder="Option 4"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Select
            label="Correct Option"
            value={String(correctAnswer)}
            onChange={(e) => setCorrectAnswer(Number(e.target.value))}
            options={[
              { value: '0', label: 'Option A' },
              { value: '1', label: 'Option B' },
              { value: '2', label: 'Option C' },
              { value: '3', label: 'Option D' },
            ]}
          />
          <Select
            label="Difficulty Level"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
        </div>

        <Textarea
          label="Explanation (Shown after answering)"
          placeholder="Why is this answer correct?"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Question
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminAddQuestionModal;
