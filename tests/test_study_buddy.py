import unittest

from src.study_buddy import build_study_jam_prompt, build_fallback_brief


class StudyBuddyTest(unittest.TestCase):
    def test_prompt_contains_hackathon_output_sections(self):
        prompt = build_study_jam_prompt(
            learning_notes="Cloud Run deploys containers without managing servers.",
            goal="Prepare for Google Cloud Study Jam",
            confidence="보통",
        )

        self.assertIn("Google Cloud Study Jam", prompt)
        self.assertIn("5줄 요약", prompt)
        self.assertIn("복습 퀴즈 5개", prompt)
        self.assertIn("약점 개념 3개", prompt)
        self.assertIn("다음 실습 체크리스트", prompt)
        self.assertIn("오늘 30분 액션", prompt)
        self.assertIn("Cloud Run deploys containers", prompt)

    def test_fallback_brief_is_demo_ready_when_api_key_missing(self):
        brief = build_fallback_brief(
            learning_notes="Gemini API can generate structured study guides.",
            goal="Review Gemini API",
            confidence="낮음",
        )

        self.assertIn("### 5줄 요약", brief)
        self.assertIn("### 복습 퀴즈 5개", brief)
        self.assertIn("### 약점 개념 3개", brief)
        self.assertIn("### 다음 실습 체크리스트", brief)
        self.assertIn("### 오늘 30분 액션", brief)
        self.assertIn("Gemini API", brief)


if __name__ == "__main__":
    unittest.main()
