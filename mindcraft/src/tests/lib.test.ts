import { describe, expect, test } from 'bun:test';
import {
  isVerifyJwtTokenSuccess,
  verifyJwtToken,
  generateAccessToken,
  generateRefreshToken,
  createSessionId,
  handleDBError,
  createMaterialSummary,
  isCreateMaterialSummarySuccess,
  generateQuestions,
  isGenerateQuestionsError,
} from '../lib';


describe('JWT Token', () => {
  test('generateAccessToken should generate a valid JWT token', async () => {
    const accessToken = await generateAccessToken({ name: "Mr. Bilek" })
    expect(accessToken).toBeString()
  })

  test('generateRefreshToken should generate a valid JWT token', async () => {
    const refreshToken = await generateRefreshToken({ name: "Mr. Bilek" })
    expect(refreshToken).toBeString()
  })

  test('verifyJwtToken should verify a valid JWT token', async () => {
    const accessToken = await generateAccessToken({ name: "Mr. Bilek" })
    const result = await verifyJwtToken(accessToken)
    if (isVerifyJwtTokenSuccess(result)) {
      expect(result.payload.name).toBe("Mr. Bilek")
    }
  })

  test('verifyJwtToken should not verify an invalid JWT token', async () => {
    const result = await verifyJwtToken('invalid-token')
    if (!isVerifyJwtTokenSuccess(result)) {
      expect(result.error).toBeString()
    }
  })
})

describe('Session', () => {
  test('createSessionId should generate a valid session id', async () => {
    const sessionId = createSessionId(1)
    expect(sessionId.split(':')[0]).toBe("1")
    expect(sessionId.split(':')[1].length).toBe(36)
  })
})

describe('Database', () => {
  test('handleDBError should return an error message', async () => {
    const error = handleDBError(new Error('Database error'), 'Unable to get data')
    expect(error.errors[0].messages[0]).toBe('Unable to get data: Database error')
  })
})


describe('Challenge utilities', () => {
  test('createMaterialSummary should create a material summary', async () => {
    const filePath = await Bun.resolve('./3000-chars-material.txt', __dirname)
    const material = Bun.file(filePath)
    const materialText = await material.text()
    console.log(materialText.length)
    const summary = await createMaterialSummary(materialText)

    if (isCreateMaterialSummarySuccess(summary)) {
      expect(summary.summary).toBeString()
    } else {
      expect(summary.error).toBeString()
    }
  }, 60000)

  test('generateQuestions should generate questions', async () => {
    const filePath = await Bun.resolve('./3000-chars-material.txt', __dirname)
    const material = Bun.file(filePath)
    const materialText = await material.text()
    const questions = await generateQuestions(materialText)

    if (isGenerateQuestionsError(questions)) {
      expect(questions.error).toBeString()
    } else {
      expect(questions).toBeArray()
      expect(questions).not.toBeEmpty()
      expect(questions.length).toBeGreaterThanOrEqual(5)
      
      for (const question of questions) {
        expect(question.question).toBeString()
        expect(question.options).toBeObject()
        expect(Object.keys(question.options)).toStrictEqual(['A', 'B', 'C', 'D'])
        expect(question).toHaveProperty('correct_answer')
      }
    }
  }, 60000)
})

