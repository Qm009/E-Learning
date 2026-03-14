-- Temporarily update all existing draft courses to published so students can see them
-- (Including the ones recently created with quizzes)
UPDATE courses SET status = 'published';
