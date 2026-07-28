CREATE TABLE IF NOT EXISTS kv_uni_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  level VARCHAR(20) NOT NULL DEFAULT 'beginner',
  thumbnail_url TEXT,
  duration_minutes INT DEFAULT 0,
  lesson_count INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kv_uni_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES kv_uni_courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  content TEXT,
  video_url TEXT,
  content_type VARCHAR(20) DEFAULT 'article',
  duration_minutes INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, slug)
);

CREATE TABLE IF NOT EXISTS kv_uni_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES kv_uni_courses(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS kv_uni_lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES kv_uni_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS kv_uni_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES kv_uni_lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kv_uni_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES kv_uni_quizzes(id) ON DELETE CASCADE,
  selected_answer VARCHAR(10) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kv_uni_lessons_course ON kv_uni_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_kv_uni_enrollments_user ON kv_uni_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_kv_uni_lesson_completions_user ON kv_uni_lesson_completions(user_id);
