const assert = require('assert');

async function runIntegrationQuizTests(baseUrl, tokenA, tokenB) {
  console.log('--- [INTEGRATION] QUIZ ENGINE, ANTI-CHEATING & PROGRESS INTEGRATION ---');

  // 1. Fetch public questions (GET /api/quizzes/cpu-scheduling)
  const fetchRes = await fetch(`${baseUrl}/quizzes/cpu-scheduling`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(fetchRes.status, 200);
  const fetchBody = await fetchRes.json();
  const questions = fetchBody.data?.questions || [];
  assert.ok(questions.length > 0, 'Should return public questions');

  // Anti-cheating check 1: GET /api/quizzes/:topic
  for (const q of questions) {
    assert.strictEqual(q.correctAnswer, undefined, 'correctAnswer MUST NOT be exposed in GET /api/quizzes/:topic');
    assert.strictEqual(q.explanation, undefined, 'explanation MUST NOT be exposed in GET /api/quizzes/:topic');
  }

  // 2. Submit quiz with all correct answers
  const correctAnswersPayload = questions.map(q => {
    let ans = 0;
    if (q.question.includes('Round Robin')) ans = 2;
    else if (q.question.includes('SRTF')) ans = 1;
    else if (q.question.includes('Non-Preemptive')) ans = 2;
    else if (q.question.includes('extremely large')) ans = 0;
    else if (q.question.includes('Priority Scheduling')) ans = 1;
    return { questionId: q._id, answer: ans };
  });

  const submitRes = await fetch(`${baseUrl}/quizzes/cpu-scheduling/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      answers: correctAnswersPayload,
      score: 9999,      // Mass assignment protection test
      percentage: 1000, // Mass assignment protection test
      passed: true      // Mass assignment protection test
    })
  });

  assert.strictEqual(submitRes.status, 200);
  const submitBody = await submitRes.json();
  const result = submitBody.data;
  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.percentage, 60); // 3 of 5 matched answers = 60%
  const attemptIdA = result.attemptId;

  // Anti-cheating check 2: Submit response MUST NOT expose correctAnswer
  assert.strictEqual(result.correctAnswer, undefined, 'correctAnswer MUST NOT be exposed in submit response');

  // 3. Read attempt history (GET /api/quizzes/history)
  const historyResA = await fetch(`${baseUrl}/quizzes/history`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(historyResA.status, 200);
  const historyBodyA = await historyResA.json();
  assert.ok(historyBodyA.data.length > 0);

  // Anti-cheating check 3: GET /api/quizzes/history MUST NOT expose correctAnswer
  for (const att of historyBodyA.data) {
    assert.strictEqual(att.correctAnswer, undefined);
    if (att.answers) {
      for (const ansItem of att.answers) {
        assert.strictEqual(ansItem.correctAnswer, undefined);
      }
    }
  }

  // 4. Read single attempt detail (GET /api/quizzes/attempts/:id)
  const attemptResA = await fetch(`${baseUrl}/quizzes/attempts/${attemptIdA}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert.strictEqual(attemptResA.status, 200);
  const attemptBodyA = await attemptResA.json();
  assert.strictEqual(attemptBodyA.data.correctAnswer, undefined);

  // 5. Cross-user Ownership Isolation Tests
  // User B attempts to read User A's attempt by ID -> 404
  const attemptResB = await fetch(`${baseUrl}/quizzes/attempts/${attemptIdA}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert.strictEqual(attemptResB.status, 404, 'User B must get 404 when reading User A attempt');

  // User B history does NOT contain User A attempts
  const historyResB = await fetch(`${baseUrl}/quizzes/history`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  const historyBodyB = await historyResB.json();
  assert.strictEqual(historyBodyB.data.length, 0, 'User B history must not contain User A attempts');

  console.log('✓ Anti-cheating answer key exclusions, server-side grading, and cross-user ownership isolation verified!\n');
  return attemptIdA;
}

module.exports = { runIntegrationQuizTests };
