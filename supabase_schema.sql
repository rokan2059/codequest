-- 1. PROFILES TABLE (Linked to Auth)
-- We use 'IF NOT EXISTS' and then 'ALTER' to ensure extra safety if the table is already there from a previous run.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  points INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  solved_puzzle_ids TEXT[] DEFAULT '{}',
  achievement_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist in profiles (in case of schema updates)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS solved_puzzle_ids TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievement_ids TEXT[] DEFAULT '{}';

-- Cleanup legacy table if it exists
DROP TABLE IF EXISTS public.solved_puzzles CASCADE;

-- 2. PUZZLES TABLE
-- Dropping with CASCADE to handle potential foreign key constraints from other tables.
DROP TABLE IF EXISTS public.puzzles CASCADE;
CREATE TABLE public.puzzles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  points INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  required_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ACHIEVEMENTS TABLE
DROP TABLE IF EXISTS public.achievements CASCADE;
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  required_puzzles INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
    CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Puzzles are viewable by everyone" ON public.puzzles;
    CREATE POLICY "Puzzles are viewable by everyone" ON puzzles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
    CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);
END $$;

-- 6. AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'player');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. SEED DATA
-- This will populate the puzzles so you actually see some!
INSERT INTO public.puzzles (id, title, difficulty, points, xp, description, code, answer, category)
VALUES 
('js-1', 'Array Sum', 'Easy', 10, 150, 'Return the sum of all elements in the array.', 'const sum = (arr) => arr.reduce((a, b) => a + b, 0);\nconsole.log(sum([1, 2, 3]));', '6', 'Arrays'),
('js-2', 'Filter Even', 'Easy', 15, 200, 'Filter even numbers from an array.', 'const evens = (arr) => arr.filter(x => x % 2 === 0);\nconsole.log(evens([1, 2, 3, 4]).length);', '2', 'Arrays'),
('js-3', 'Async Wait', 'Medium', 30, 450, 'What is logged by this async function?', 'async function test() {\n  const p = Promise.resolve(10);\n  console.log(await p);\n}\ntest();', '10', 'Async'),
('js-4', 'Object Keys', 'Easy', 10, 150, 'Count the number of keys in the object.', 'const obj = { a: 1, b: 2, c: 3 };\nconsole.log(Object.keys(obj).length);', '3', 'Objects');

INSERT INTO public.achievements (id, name, description, icon, required_puzzles)
VALUES 
('ach-1', 'First Steps', 'Solve your first puzzle', '🚀', 1),
('ach-2', 'Getting Serious', 'Solve 5 puzzles', '🔥', 5),
('ach-3', 'Master of Arrays', 'Solve 10 array puzzles', '📜', 10);

