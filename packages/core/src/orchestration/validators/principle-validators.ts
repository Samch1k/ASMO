/**
 * Principle Validators - BMAD principles enforcement
 *
 * Implements strict validation for BMAD agent principles:
 * - ZeroAmbiguityValidator (Bob - Scrum Master)
 * - BoringTechnologyValidator (Winston - Architect)
 * - WhyFirstValidator (John - Product Owner)
 *
 * Mode: STRICT BLOCKING (соответствует выбору пользователя)
 *
 * BMAD Phase 2.2: Principle validators with bilingual support
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  principle: string
  agent: string
}

// =============================================================================
// BOB'S PRINCIPLE: ZERO AMBIGUITY
// =============================================================================

/**
 * ZeroAmbiguityValidator - Bob's Core Principle
 *
 * "If it's ambiguous, it's not ready" - Bob (Scrum Master)
 *
 * Detects vague terms that make requirements unclear:
 * - Quantifiers: "some", "many", "few", "often"
 * - Qualifiers: "fast", "slow", "easy", "user-friendly"
 * - Scope terms: "etc", "appropriate", "reasonable"
 *
 * Requires:
 * - Specific numbers or metrics
 * - Measurable criteria
 * - Clear Given-When-Then format (recommended)
 *
 * STRICT MODE: BLOCKS completion if ambiguous terms found
 */
export class ZeroAmbiguityValidator {
  private ambiguousTerms = [
    // Vague quantifiers (EN)
    'some', 'few', 'many', 'several', 'most', 'often', 'rarely',
    'usually', 'sometimes', 'occasionally', 'frequently',
    // Vague quantifiers (RU)
    'некоторые', 'несколько', 'многие', 'часто', 'редко',
    'обычно', 'иногда', 'большинство',

    // Vague qualifiers (EN)
    'fast', 'slow', 'quickly', 'efficient', 'user-friendly',
    'intuitive', 'easy', 'simple', 'complex', 'good', 'bad',
    'better', 'worse', 'high', 'low', 'more', 'less',
    // Vague qualifiers (RU)
    'быстро', 'медленно', 'эффективно', 'удобно',
    'интуитивно', 'легко', 'просто', 'сложно', 'хорошо', 'плохо',
    'лучше', 'хуже', 'высокий', 'низкий', 'больше', 'меньше',

    // Vague scope (EN)
    'etc', 'and so on', 'among others', 'appropriate',
    'relevant', 'necessary', 'adequate', 'reasonable',
    'sufficient', 'various', 'numerous',
    // Vague scope (RU)
    'и т.д', 'и так далее', 'подходящий', 'необходимый',
    'достаточный', 'разумный', 'различный', 'многочисленный'
  ]

  /**
   * Validate text for ambiguous terms
   *
   * @param text - Text to validate (story, requirement, AC)
   * @param language - Language for error messages ('en' or 'ru')
   * @returns Validation result with errors/warnings
   */
  async validate(text: string, language: 'en' | 'ru' = 'en'): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for ambiguous terms
    const foundTerms: string[] = []
    for (const term of this.ambiguousTerms) {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi')
      if (regex.test(text)) {
        foundTerms.push(term)
      }
    }

    // Add errors for found ambiguous terms
    if (foundTerms.length > 0) {
      const msg = language === 'ru'
        ? `🚫 Bob говорит: Неоднозначные термины найдены: ${foundTerms.join(', ')}`
        : `🚫 Bob says: Ambiguous terms found: ${foundTerms.join(', ')}`
      errors.push(msg)

      const advice = language === 'ru'
        ? '   Будьте конкретны: используйте числа, метрики или примеры'
        : '   Be specific: use numbers, metrics, or examples'
      errors.push(advice)

      // Add specific examples
      const example = language === 'ru'
        ? '   Пример: вместо "быстро" → "< 200ms", вместо "многие" → ">80% пользователей"'
        : '   Example: instead of "fast" → "< 200ms", instead of "many" → ">80% of users"'
      errors.push(example)
    }

    // Check for measurable criteria (numbers present)
    if (!/\d+/.test(text) && text.length > 100) {
      const msg = language === 'ru'
        ? '⚠️  Числа не найдены - добавьте измеримые критерии'
        : '⚠️  No numbers found - add measurable criteria'
      warnings.push(msg)
    }

    // Check for Given-When-Then format (recommended)
    const hasGWT = /Given|When|Then|Дано|Когда|Тогда/i.test(text)
    if (!hasGWT) {
      const msg = language === 'ru'
        ? '💡 Рассмотрите формат Дано-Когда-Тогда для ясности'
        : '💡 Consider Given-When-Then format for clarity'
      warnings.push(msg)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      principle: 'zero_ambiguity',
      agent: language === 'ru' ? 'Bob (Scrum-мастер)' : 'Bob (Scrum Master)'
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

// =============================================================================
// WINSTON'S PRINCIPLE: BORING TECHNOLOGY
// =============================================================================

/**
 * BoringTechnologyValidator - Winston's Core Principle
 *
 * "Let's choose boring technology that works" - Winston (Architect)
 *
 * Warns about risky technology choices:
 * - Cutting-edge frameworks (Bun, Deno vs Node.js)
 * - Complex patterns (Microservices vs Monolith)
 * - Trendy but immature tech (GraphQL vs REST for simple cases)
 *
 * Mode: WARNINGS ONLY (does not block, but advises)
 */
export class BoringTechnologyValidator {
  private riskyTech = [
    {
      name: 'MongoDB',
      reason_en: 'Consider PostgreSQL with JSONB for relational data',
      reason_ru: 'Рассмотрите PostgreSQL с JSONB для реляционных данных',
      risk: 'medium'
    },
    {
      name: 'GraphQL',
      reason_en: 'REST is simpler for most cases',
      reason_ru: 'REST проще для большинства случаев',
      risk: 'medium'
    },
    {
      name: 'Microservices',
      reason_en: 'Start with modular monolith, refactor later',
      reason_ru: 'Начните с модульного монолита, рефакторьте позже',
      risk: 'high'
    },
    {
      name: 'Bun',
      reason_en: 'Node.js is battle-tested and mature',
      reason_ru: 'Node.js проверен в боях и зрел',
      risk: 'high'
    },
    {
      name: 'Deno',
      reason_en: 'Node.js has mature ecosystem',
      reason_ru: 'У Node.js зрелая экосистема',
      risk: 'medium'
    },
    {
      name: 'WebAssembly',
      reason_en: 'JavaScript/TypeScript sufficient for most cases',
      reason_ru: 'JavaScript/TypeScript достаточно для большинства случаев',
      risk: 'medium'
    },
    {
      name: 'Kubernetes',
      reason_en: 'Overkill for small teams, consider simpler hosting',
      reason_ru: 'Излишне для небольших команд, рассмотрите проще хостинг',
      risk: 'high'
    }
  ]

  /**
   * Validate technology stack choices
   *
   * @param techStack - Array of technology names
   * @param language - Language for messages ('en' or 'ru')
   * @returns Validation result (warnings only, always valid)
   */
  async validate(techStack: string[], language: 'en' | 'ru' = 'en'): Promise<ValidationResult> {
    const warnings: string[] = []

    for (const tech of techStack) {
      const risky = this.riskyTech.find(rt =>
        tech.toLowerCase().includes(rt.name.toLowerCase())
      )

      if (risky) {
        const reason = language === 'ru' ? risky.reason_ru : risky.reason_en
        const riskText = language === 'ru'
          ? (risky.risk === 'high' ? 'высокий риск' : 'средний риск')
          : `${risky.risk} risk`

        const msg = `⚠️  Winston says: "${risky.name}" is ${riskText} - ${reason}`
        warnings.push(msg)
      }
    }

    // Add general advice if risky tech found
    if (warnings.length > 0) {
      const advice = language === 'ru'
        ? '💡 Winston рекомендует: выбирайте скучные, проверенные технологии'
        : '💡 Winston recommends: choose boring, proven technology'
      warnings.push(advice)
    }

    return {
      valid: true,  // Warnings only - does not block
      errors: [],
      warnings,
      principle: 'boring_technology',
      agent: language === 'ru' ? 'Winston (Архитектор)' : 'Winston (Architect)'
    }
  }
}

// =============================================================================
// JOHN'S PRINCIPLE: WHY FIRST
// =============================================================================

/**
 * WhyFirstValidator - John's Core Principle
 *
 * "Let's understand WHY before deciding HOW" - John (Product Owner)
 *
 * Requires clear business value explanation:
 * - Must include "why", "because", "so that", or "business value"
 * - Should follow user story format: "As a... I want... So that..."
 * - Focuses on outcomes over outputs
 *
 * STRICT MODE: BLOCKS if no business value/impact explained
 */
export class WhyFirstValidator {
  /**
   * Validate requirement for business value explanation
   *
   * @param requirement - Requirement or story text
   * @param language - Language for messages ('en' or 'ru')
   * @returns Validation result with errors/warnings
   */
  async validate(requirement: string, language: 'en' | 'ru' = 'en'): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for "why" or business value keywords
    const whyKeywords = language === 'ru'
      ? /почему|потому что|чтобы|для того чтобы|бизнес|влияние|результат|ценность|выгода/i
      : /why|because|so that|to enable|business value|impact|outcome|benefit/i

    const hasWhy = whyKeywords.test(requirement)

    if (!hasWhy) {
      const msg = language === 'ru'
        ? '🚫 John говорит: Отсутствует "ПОЧЕМУ" - объясните бизнес-ценность или влияние на пользователей'
        : '🚫 John says: Missing "WHY" - explain business value or user impact'
      errors.push(msg)

      const example = language === 'ru'
        ? '   Пример: "Чтобы пользователи могли...", "Для обеспечения...", "Бизнес-влияние: ..."'
        : '   Example: "So that users can...", "To enable...", "Business impact: ..."'
      errors.push(example)
    }

    // Check user story format (recommended)
    const userStoryPattern = language === 'ru'
      ? /Как|Я хочу|Чтобы/
      : /As a|I want|So that/

    const hasUserStoryFormat = userStoryPattern.test(requirement)

    if (!hasUserStoryFormat) {
      const msg = language === 'ru'
        ? '💡 Рассмотрите формат: "Как [пользователь], Я хочу [функция], Чтобы [выгода]"'
        : '💡 Consider format: "As a [user], I want [feature], So that [benefit]"'
      warnings.push(msg)
    }

    // Check for outcome-focused language
    const outcomeKeywords = language === 'ru'
      ? /результат|исход|эффект|улучшение|увеличение|сокращение/i
      : /outcome|result|effect|improvement|increase|reduce/i

    if (!outcomeKeywords.test(requirement) && hasWhy) {
      const msg = language === 'ru'
        ? '💡 John рекомендует: фокусируйтесь на результатах, а не только на функциях'
        : '💡 John recommends: focus on outcomes, not just outputs'
      warnings.push(msg)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      principle: 'why_first',
      agent: language === 'ru' ? 'John (Владелец Продукта)' : 'John (Product Owner)'
    }
  }
}
