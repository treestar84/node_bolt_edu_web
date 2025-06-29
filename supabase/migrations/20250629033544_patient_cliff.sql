/*
  # RLS 정책 수정 - 사용자 프로필 생성 오류 해결

  1. 기존 정책 수정
    - user_profiles INSERT 정책을 더 관대하게 수정
    - user_progress INSERT 정책 추가
    - 모든 정책에 적절한 WITH CHECK 조건 추가

  2. 보안 강화
    - 사용자가 자신의 데이터만 접근할 수 있도록 보장
    - 회원가입 시 프로필 생성이 원활하게 되도록 개선
*/

-- 기존 user_profiles 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- 더 관대한 INSERT 정책 생성 (회원가입 시 프로필 생성 허용)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- user_progress에 누락된 INSERT 정책 추가
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- user_progress UPDATE 정책 수정 (WITH CHECK 추가)
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- user_badges INSERT 정책에 WITH CHECK 추가
DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;

CREATE POLICY "Users can insert own badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());