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

-- 2A. CATEGORIES TABLE
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2B. PUZZLES TABLE
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
  category TEXT NOT NULL REFERENCES public.categories(name) ON UPDATE CASCADE ON DELETE CASCADE,
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
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

    CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Puzzles are viewable by everyone" ON public.puzzles;
    CREATE POLICY "Puzzles are viewable by everyone" ON public.puzzles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
    CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);
END $$;

-- 5.1 Admin role function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5.2 Admin policies using the security definer function
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
    CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());
    
    CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
    DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
    DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
    DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
    CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());
    
    DROP POLICY IF EXISTS "Admins can manage puzzles" ON public.puzzles;
    DROP POLICY IF EXISTS "Admins can insert puzzles" ON public.puzzles;
    DROP POLICY IF EXISTS "Admins can update puzzles" ON public.puzzles;
    DROP POLICY IF EXISTS "Admins can delete puzzles" ON public.puzzles;
    CREATE POLICY "Admins can manage puzzles" ON public.puzzles FOR ALL USING (public.is_admin());
    
    DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;
    DROP POLICY IF EXISTS "Admins can insert achievements" ON public.achievements;
    DROP POLICY IF EXISTS "Admins can update achievements" ON public.achievements;
    DROP POLICY IF EXISTS "Admins can delete achievements" ON public.achievements;
    CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL USING (public.is_admin());
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
-- Populate required categories
INSERT INTO public.categories (name) VALUES 
('Arrays'),
('Async'),
('Objects'),
('Strings'),
('Logic')
ON CONFLICT (name) DO NOTHING;

-- This will populate the puzzles so you actually see some!
INSERT INTO public.puzzles (id, title, difficulty, points, xp, description, code, answer, category)
VALUES 
('js-1', 'Array Sum', 'Easy', 10, 150, 'Return the sum of all elements in the array.', 'const sum = (arr) => arr.reduce((a, b) => a + b, 0);\nconsole.log(sum([1, 2, 3]));', '6', 'Arrays'),
('js-2', 'Filter Even', 'Easy', 15, 200, 'Filter even numbers from an array.', 'const evens = (arr) => arr.filter(x => x % 2 === 0);\nconsole.log(evens([1, 2, 3, 4]).length);', '2', 'Arrays'),
('js-3', 'Async Wait', 'Medium', 30, 450, 'What is logged by this async function?', 'async function test() {\n  const p = Promise.resolve(10);\n  console.log(await p);\n}\ntest();', '10', 'Async'),
('js-4', 'Object Keys', 'Easy', 10, 150, 'Count the number of keys in the object.', 'const obj = { a: 1, b: 2, c: 3 };\nconsole.log(Object.keys(obj).length);', '3', 'Objects'),
('js-5', 'String Reverse', 'Easy', 10, 150, 'Reverse the given string.', 'const rev = (str) => str.split("").reverse().join("");\nconsole.log(rev("hello"));', 'olleh', 'Strings'),
('js-6', 'Palindrome Check', 'Easy', 15, 200, 'Check if the string is a palindrome. Output "true" or "false".', 'const isPal = (s) => s === s.split("").reverse().join("");\nconsole.log(isPal("racecar"));', 'true', 'Strings'),
('js-7', 'FizzBuzz Logic', 'Easy', 10, 150, 'What is the 15th element of FizzBuzz (starting from 1)? (Fizz, Buzz, or FizzBuzz?)', 'function fizzBuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return n;\n}\nconsole.log(fizzBuzz(15));', 'FizzBuzz', 'Logic'),
('js-8', 'Fibonacci Sequence', 'Medium', 25, 400, 'What is the 6th Fibonacci number (starting from 0, 1, 1...)?', 'function fib(n) {\n  if (n <= 1) return n;\n  return fib(n-1) + fib(n-2);\n}\nconsole.log(fib(5));', '5', 'Logic'),
('js-9', 'Multiple Decisions', 'Medium', 20, 300, 'What value does this logic return?', 'const x = 10; const y = 5;\nconsole.log(x > y ? (y * 2 === x ? "match" : "no") : "low");', 'match', 'Logic'),
('js-10', 'Array Map', 'Easy', 10, 150, 'Multiply each element by 2 and return sum.', 'const arr = [1, 2, 3];\nconst result = arr.map(x => x * 2).reduce((a, b) => a + b, 0);\nconsole.log(result);', '12', 'Arrays');

INSERT INTO public.achievements (id, name, description, icon, required_puzzles)
VALUES 
('ach-1', 'First Steps', 'Solve your first puzzle', '🚀', 1),
('ach-2', 'Getting Serious', 'Solve 5 puzzles', '🔥', 5),
('ach-3', 'Master of Arrays', 'Solve 10 array puzzles', '📜', 10);

