# BMAD Implementation Agent Prompt

**Роль**: Implementation Agent (Full-Stack Developer + Architect)
**Задача**: Реализация интеграции BMAD методологии в ASMO согласно утвержденному плану
**План**: `/Users/aliaksandrsmolka/.claude/plans/quirky-conjuring-unicorn-updated.md`
**Дата начала**: 2026-02-02
**Estimated effort**: 5-7 недель (4 фазы)

---

## Контекст проекта

Ты - Implementation Agent, отвечающий за внедрение BMAD (Business Model Architecture Design) методологии в ASMO Multi-Agent Orchestration System.

**ASMO** - это система оркестрации мультиагентных AI workflows, написанная на TypeScript с использованием Anthropic Claude API.

**BMAD METHOD** - методология разработки с персонализированными агентами (Amelia, Winston, Bob, John), строгими принципами (test enforcement, zero ambiguity) и menu-driven командами ([IR], [DS], [CC] и т.д.).

**Текущее состояние**:
- ✅ 5 из 8 BMAD workflows уже реализованы ([IR], [CC], [CP], [VP], [CE])
- ❌ Отсутствуют: menu-driven команды, personalities, principles, validators
- ❌ 3 workflow не реализованы ([DS], [CR], [CS])

---

## Твоя миссия

Реализовать полную интеграцию BMAD в ASMO за 4 фазы:

### Фаза 1 (Недели 1-2): Критичные компоненты
- MenuCommandRouter (билингвальный EN/RU)
- TestEnforcementValidator (Amelia's principle)
- 3 новых workflow: dev_story, code_review, create_story

### Фаза 2 (Недели 3-4): Personalities & Principles
- Agent Personalities в agents.yaml (Amelia, Winston, Bob, John)
- PrincipleValidators (ZeroAmbiguity, BoringTech, WhyFirst)
- Обновление markdown prompts

### Фаза 3 (Недели 5-6): Dynamic Prompts
- PersonalityPromptLoader
- Integration в BaseAgent
- Comprehensive testing

### Фаза 4 (Неделя 7): Documentation
- 8 файлов BMAD guides (EN + RU)
- CHANGELOG и release notes
- Обновление README и quick-start

---

## Детальный план выполнения

### 📋 ФАЗА 1: КРИТИЧНЫЕ КОМПОНЕНТЫ

#### Задача 1.1: MenuCommandRouter (Дни 1-2)

**Файл**: `packages/core/src/orchestration/menu-command-router.ts`

**Требования**:
- Распознавание команд: [IR], [DS], [CC], [CR], [CS], [CP], [VP], [CE] (EN)
- Поддержка RU: [ГР], [ИС], [КК], [КО], [СИ], [СБ], [ВТ], [СЭ]
- Маппинг на существующие workflows (5 workflows)
- Маппинг на новые workflows (3 workflows)
- Извлечение task context из команды
- Валидация required context

**Реализация**:
```typescript
export class MenuCommandRouter {
  private commands: Map<string, MenuCommand>

  constructor(private workflowEngine: WorkflowEngine) {
    this.commands = this.loadCommands()
  }

  async detectAndRoute(input: string): Promise<MenuCommandMatch | null> {
    // Pattern: [IR] или [ГР]
    const commandPattern = /\[([A-ZА-Я]{2,4})\]/gi
    // ... routing logic
  }

  private loadCommands(): Map<string, MenuCommand> {
    // 5 existing + 3 new workflows
  }
}
```

**Интеграция в WorkflowEngine**:
- Модифицировать `packages/core/src/orchestration/workflow-engine.ts`
- Добавить `private menuRouter: MenuCommandRouter`
- Инициализировать в `initialize()` ПОСЛЕ загрузки workflows
- Добавить логику в `execute()` для детекта menu commands ПЕРЕД fallback

**Интеграция в CLI**:
- Модифицировать `packages/cli/src/commands/run.ts`
- Menu command detection автоматический через `engine.execute()`

**Тесты**:
```bash
asmo run "[IR]"  # ✅ должен работать (existing workflow)
asmo run "[DS] implement auth"  # ❌ → ✅ после создания workflow
asmo run "[ГР]"  # ✅ Russian command
```

---

#### Задача 1.2: TestEnforcementValidator (Дни 3-4)

**Файл**: `packages/core/src/orchestration/validators/test-enforcement-validator.ts`

**Требования**:
- Проверка наличия test_results в step output
- Блокирование completion если tests fail (failed > 0)
- Проверка coverage threshold (опционально)
- Логирование в стиле Amelia

**Реализация**:
```typescript
export class TestEnforcementValidator {
  async validateTestPassage(
    state: AgentState,
    step: WorkflowStep,
    stepResult: StepResult
  ): Promise<ValidationResult> {
    if (!this.requiresTestEnforcement(step)) {
      return { valid: true, errors: [] }
    }

    const testResults = this.extractTestResults(stepResult.output)

    if (!testResults) {
      errors.push('🚫 Amelia says: No test results found')
      return { valid: false, errors }
    }

    if (testResults.failed > 0) {
      errors.push(`🚫 Amelia says: ${testResults.failed} test(s) failing`)
      return { valid: false, errors }
    }

    return { valid: true, errors: [] }
  }
}
```

**Интеграция в WorkflowEngine**:
- Добавить `private testEnforcementValidator: TestEnforcementValidator`
- В `executeStep()` вызвать validation ПОСЛЕ выполнения step
- BLOCK если `!testValidation.valid` (throw Error)

**Обновление Developer Agent**:
- Модифицировать `packages/core/src/agents/roles/developer.agent.ts`
- Добавить в return: `context.test_results = testResults`
- Реализовать `private async runTests()` (mock для MVP)

---

#### Задача 1.3: Новые Workflows (Дни 1-3 недели 2)

**Файл 1**: `packages/core/templates/workflows/21-dev-story/dev_story_workflow.json`

**Требования**:
- TDD workflow: Red → Green → Refactor → Review
- 4 steps с role_id: developer (x3) + code-reviewer
- metadata: `test_enforcement: true`, `min_coverage: 100`
- Bilingual keywords в trigger_condition

**Структура**:
```json
{
  "id": "dev_story_workflow",
  "name": "Dev Story Workflow",
  "description": "TDD-based story implementation with 100% test coverage (Amelia's way)",
  "trigger_condition": {
    "keywords": ["implement story", "develop story", "реализовать историю"],
    "task_types": ["development", "implementation"],
    "required_skills": ["coding", "testing"]
  },
  "steps": [
    { "order": 1, "role_id": "developer", "phase": "test_first", "description": "Write failing tests (Red phase)" },
    { "order": 2, "role_id": "developer", "phase": "implementation", "description": "Implement code (Green phase)", "metadata": { "test_enforcement": true } },
    { "order": 3, "role_id": "developer", "phase": "refactoring", "description": "Refactor (Refactor phase)" },
    { "order": 4, "role_id": "code-reviewer", "phase": "review", "description": "Review code quality" }
  ],
  "metadata": { "bmad": true, "principles": ["test_enforcement", "tdd"] }
}
```

**Файл 2**: `packages/core/templates/workflows/22-code-review/code_review_workflow.json`

**Требования**:
- 3 steps: code-reviewer → adversarial-reviewer → security-specialist
- Comprehensive review

**Файл 3**: `packages/core/templates/workflows/23-create-story/create_story_workflow.json`

**Требования**:
- 4 steps: product-owner → scrum-master → test-architect → architect
- Bob's zero ambiguity principle
- metadata: `ambiguity_check: true`

---

### 📋 ФАЗА 2: PERSONALITIES & PRINCIPLES

#### Задача 2.1: Agent Personalities (Дни 1-2)

**Файл**: `packages/core/src/orchestration/config/agents.yaml`

**Требования**:
- Добавить секции `personality` и `principles` для 4 агентов:
  - developer → Amelia
  - architect → Winston
  - scrum_master → Bob
  - product_owner → John

**Структура personality**:
```yaml
developer:
  id: developer
  name: Amelia  # ✨ BMAD persona

  personality:
    traits: [perfectionist, test-driven, quality-focused]
    style: "Direct and uncompromising about testing"
    catchphrase_en: "I will not mark this complete until 100% of tests pass"
    catchphrase_ru: "Я не завершу это, пока все тесты не пройдут на 100%"
    communication:
      formality: medium
      emoji_usage: minimal
      signature_en: "- Amelia, Developer (Tests Must Pass ✅)"
      signature_ru: "- Амелия, Разработчик (Тесты Обязательны ✅)"

  principles:
    - name: "test_enforcement"
      description_en: "100% test passage before completion"
      description_ru: "100% прохождение тестов перед завершением"
      strict: true  # BLOCKING
    - name: "tdd_workflow"
      description_en: "Red-Green-Refactor cycle"
      description_ru: "Цикл Red-Green-Refactor"
      strict: false
```

**Аналогично для**:
- Winston (architect): boring_technology, scale_later
- Bob (scrum_master): zero_ambiguity, definition_of_done
- John (product_owner): why_first, outcome_over_output

---

#### Задача 2.2: PrincipleValidators (День 3-4)

**Файл**: `packages/core/src/orchestration/validators/principle-validators.ts`

**Требования**:
- 3 класса: ZeroAmbiguityValidator, BoringTechnologyValidator, WhyFirstValidator
- Bilingual error messages (EN + RU)
- STRICT BLOCKING mode

**ZeroAmbiguityValidator**:
```typescript
export class ZeroAmbiguityValidator {
  private ambiguousTerms = [
    'some', 'few', 'many', 'often', 'rarely',  // EN
    'некоторые', 'несколько', 'часто', 'редко'  // RU
  ]

  async validate(text: string, language: 'en' | 'ru' = 'en'): Promise<ValidationResult> {
    for (const term of this.ambiguousTerms) {
      if (new RegExp(`\\b${term}\\b`, 'gi').test(text)) {
        errors.push(`🚫 Bob says: Ambiguous term "${term}"`)
      }
    }
    return { valid: errors.length === 0, errors, principle: 'zero_ambiguity' }
  }
}
```

**BoringTechnologyValidator**:
- Список risky_tech: MongoDB, GraphQL, Microservices, Bun, Deno
- WARNINGS only (не блокирует)

**WhyFirstValidator**:
- Проверка наличия "why", "business value", "impact"
- БЛОКИРУЕТ если нет WHY

**Интеграция в WorkflowEngine**:
- Добавить `private principleValidators = { zeroAmbiguity, boringTechnology, whyFirst }`
- Метод `validatePrinciples()` вызывается в `executeStep()` ПОСЛЕ execution
- BLOCK если `violations.length > 0`

---

#### Задача 2.3: Обновление Markdown Prompts (Дни 5-7)

**Файлы**:
- `packages/core/src/orchestration/prompts/developer.md`
- `packages/core/src/orchestration/prompts/architect.md`
- `packages/core/src/orchestration/prompts/scrum-master.md`
- `packages/core/src/orchestration/prompts/product-owner.md`

**Формат** (developer.md):
```markdown
# Developer Agent System Prompt

I'm **Amelia** (Амелия), your TDD evangelist and quality guardian.

## My Personality

I'm direct, uncompromising about testing, and take pride in writing clean, well-tested code.

**My catchphrase**: "I will not mark this complete until 100% of tests pass"
**Мой девиз**: "Я не завершу это, пока все тесты не пройдут на 100%"

## My Principles (Non-Negotiable)

1. **Test Enforcement** (STRICT): All tests must pass
2. **TDD Workflow**: Red → Green → Refactor
3. **Coverage**: I aim for 100% on new code

## My Approach

1. **Red Phase**: Write failing tests
2. **Green Phase**: Minimal code to pass
3. **Refactor Phase**: Clean up
4. **Block on Failure**: BLOCK if tests fail

*- Amelia, Developer (Tests Must Pass ✅)*
```

---

### 📋 ФАЗА 3: DYNAMIC PROMPTS

#### Задача 3.1: PersonalityPromptLoader (Дни 1-3)

**Файл**: `packages/core/src/orchestration/personality-prompt-loader.ts`

**Требования**:
- Загрузка базового prompt из markdown
- Enrichment с personality секциями
- Detect language (EN/RU) из task text
- Build personality, principles, signature sections

**Структура**:
```typescript
export class PersonalityPromptLoader {
  constructor(private configLoader: ConfigLoader) {}

  async loadPromptWithPersonality(
    agentId: string,
    task: string,
    context: Record<string, any>
  ): Promise<string> {
    const agentConfig = this.configLoader.getAgentConfig(agentId)
    const basePrompt = await this.loadMarkdownPrompt(agentConfig.prompt_template)
    const language = this.detectLanguage(task)

    const personalitySection = this.buildPersonalitySection(agentConfig, language)
    const principlesSection = this.buildPrinciplesSection(agentConfig, language)
    const signatureSection = this.buildSignatureSection(agentConfig, language)

    return `${personalitySection}\n\n${basePrompt}\n\n${principlesSection}\n\n${task}\n\n${signatureSection}`
  }

  private detectLanguage(text: string): 'en' | 'ru' {
    return /[а-яА-ЯёЁ]/.test(text) ? 'ru' : 'en'
  }
}
```

**Интеграция в BaseAgent**:
- Модифицировать `packages/core/src/agents/base-agent.ts`
- Метод `getDefaultSystemPrompt()`:
  ```typescript
  if (this.role?.personality) {
    const loader = new PersonalityPromptLoader(configLoader)
    return loader.loadPromptWithPersonality(this.agentId, '', {})
  }
  return this.getGenericSystemPrompt()
  ```

---

### 📋 ФАЗА 4: DOCUMENTATION

#### Задача 4.1: Генерация BMAD Guides (Дни 1-2)

**Файл**: `packages/core/src/scripts/generate-bmad-docs.ts`

**Требования**:
- Использовать TechWriterAgent для генерации
- 8 файлов документации (4 EN + 4 RU):
  - bmad-menu-commands.md (EN + RU)
  - bmad-personalities.md (EN + RU)
  - bmad-principles.md (EN + RU)
  - bmad-workflows.md (EN + RU)

**Структура скрипта**:
```typescript
async function generateBMADDocs() {
  const techWriter = new TechWriterAgent()

  // 1. Menu Commands (EN)
  const menuDocsEN = await techWriter.execute({
    task: 'Generate comprehensive guide for BMAD menu-driven commands with bilingual examples',
    context: { language: 'en', features: ['Command list', 'Usage examples', 'CLI integration'] }
  })
  await fs.writeFile('docs/en/guides/bmad-menu-commands.md', menuDocsEN.content)

  // 2. Menu Commands (RU)
  const menuDocsRU = await techWriter.execute({
    task: 'Создать подробное руководство по командам BMAD с двуязычными примерами',
    context: { language: 'ru', features: ['Список команд', 'Примеры', 'Интеграция'] }
  })
  await fs.writeFile('docs/ru/guides/bmad-menu-commands.md', menuDocsRU.content)

  // Repeat for: personalities, principles, workflows
}
```

**Запуск**:
```bash
node packages/core/src/scripts/generate-bmad-docs.ts
```

---

#### Задача 4.2: CHANGELOG и README (Дни 3-4)

**CHANGELOG.md**:
- Использовать TechWriterAgent для release notes
- Формат: Keep a Changelog
- Prepend к существующему CHANGELOG

**README.md**:
- Добавить секцию "BMAD Method Integration"
- Примеры menu commands
- Ссылки на BMAD guides

**Структура**:
```markdown
## BMAD Method Integration

ASMO integrates the BMAD methodology with:

- **Menu-driven commands**: `[DS]`, `[CR]`, `[IR]` (or Russian `[ИС]`, `[КО]`, `[ГР]`)
- **Agent personalities**: Amelia, Winston, Bob, John
- **BMAD principles**: test_enforcement, zero_ambiguity, boring_technology, why_first
- **Strict enforcement**: Validators block completion if principles violated

**Example**:
```bash
asmo run "[DS] implement user authentication"
asmo run "[IR]"
```

Learn more: [BMAD Menu Commands](docs/en/guides/bmad-menu-commands.md)
```

---

## Критерии успеха

### Фаза 1 (Недели 1-2):
- ✅ MenuCommandRouter работает с 5 existing + 3 new workflows
- ✅ `asmo run "[IR]"` работает
- ✅ `asmo run "[DS] implement auth"` работает после создания workflow
- ✅ TestEnforcementValidator блокирует completion при failed tests
- ✅ 3 новых workflow созданы и загружаются

### Фаза 2 (Недели 3-4):
- ✅ agents.yaml содержит personalities для Amelia, Winston, Bob, John
- ✅ PrincipleValidators блокируют при нарушениях (strict mode)
- ✅ Markdown prompts обновлены с personalities
- ✅ `asmo run "[CS] improve performance"` блокируется (ambiguous term)

### Фаза 3 (Недели 5-6):
- ✅ PersonalityPromptLoader динамически загружает prompts
- ✅ BaseAgent использует PersonalityPromptLoader
- ✅ Personality видна в logs (Amelia's catchphrase)
- ✅ Все тесты проходят

### Фаза 4 (Неделя 7):
- ✅ 8 файлов BMAD guides существуют (docs/en/guides + docs/ru/guides)
- ✅ CHANGELOG обновлен с release notes
- ✅ README содержит секцию BMAD Method Integration
- ✅ `pnpm run generate:bmad-docs` работает

---

## Важные принципы выполнения

### 1. Минимальные breaking changes
- Все новое opt-in
- Старые workflows работают без изменений
- Menu commands опциональны (fallback на existing logic)

### 2. Билингвальность (EN + RU)
- Все error messages на двух языках
- Detect language автоматически из input
- Fallback на английский если язык не определен

### 3. Strict enforcement
- TestEnforcementValidator: BLOCK если tests fail
- PrincipleValidators: BLOCK если strict: true
- Clear error messages с инструкциями

### 4. Integration points
- MenuCommandRouter → WorkflowEngine.execute()
- TestEnforcementValidator → WorkflowEngine.executeStep()
- PrincipleValidators → WorkflowEngine.executeStep()
- PersonalityPromptLoader → BaseAgent.getDefaultSystemPrompt()

### 5. Testing strategy
- Unit tests для validators
- Integration tests для MenuCommandRouter
- E2E tests для workflows
- Verify через CLI commands

---

## Порядок выполнения (строгий)

### Неделя 1:
1. **День 1**: MenuCommandRouter (basic implementation)
2. **День 2**: MenuCommandRouter integration в WorkflowEngine + CLI
3. **День 3**: TestEnforcementValidator (implementation)
4. **День 4**: TestEnforcementValidator integration + Developer Agent update
5. **День 5**: Testing menu commands + validator

### Неделя 2:
1. **День 1**: dev_story_workflow.json
2. **День 2**: code_review_workflow.json + create_story_workflow.json
3. **День 3-5**: Testing workflows, fixing issues

### Неделя 3:
1. **День 1**: Update agents.yaml (Amelia + Winston)
2. **День 2**: Update agents.yaml (Bob + John)
3. **День 3**: PrincipleValidators (all 3)
4. **День 4**: Integration validators в WorkflowEngine
5. **День 5**: Testing principles

### Неделя 4:
1. **День 1-2**: Update developer.md + architect.md
2. **День 3-4**: Update scrum-master.md + product-owner.md
3. **День 5**: Testing prompts

### Неделя 5:
1. **День 1-2**: PersonalityPromptLoader implementation
2. **День 3**: Integration в BaseAgent
3. **День 4-5**: Testing personality loading

### Неделя 6:
1. **День 1-5**: Comprehensive testing, bug fixes, refinement

### Неделя 7:
1. **День 1**: generate-bmad-docs.ts (menu-commands + personalities)
2. **День 2**: generate-bmad-docs.ts (principles + workflows)
3. **День 3**: CHANGELOG + README updates
4. **День 4-5**: Review, polish, publish

---

## Команды для проверки

```bash
# Phase 1 verification
asmo run "[IR]"                          # ✅ должен работать
asmo run "[DS] implement auth"           # ❌ → ✅
asmo run "[ГР]"                          # ✅ Russian command

# Phase 2 verification
asmo run "[CS] improve performance"      # ❌ BLOCKED (ambiguous)
asmo run "create PRD for feature"        # ❌ BLOCKED (no WHY)

# Phase 3 verification
asmo run "[DS] implement login"          # Amelia personality visible

# Phase 4 verification
ls docs/en/guides/bmad-*.md              # 4 files
ls docs/ru/guides/bmad-*.md              # 4 files
grep "BMAD v1.0" CHANGELOG.md
```

---

## Финальный чеклист

### Создано новых файлов (17):
- [ ] menu-command-router.ts
- [ ] test-enforcement-validator.ts
- [ ] dev_story_workflow.json
- [ ] code_review_workflow.json
- [ ] create_story_workflow.json
- [ ] principle-validators.ts
- [ ] personality-prompt-loader.ts
- [ ] menu-command-router.test.ts
- [ ] test-enforcement-validator.test.ts
- [ ] bmad-menu-commands.md (EN)
- [ ] bmad-menu-commands.md (RU)
- [ ] bmad-personalities.md (EN)
- [ ] bmad-personalities.md (RU)
- [ ] bmad-principles.md (EN)
- [ ] bmad-principles.md (RU)
- [ ] bmad-workflows.md (EN)
- [ ] bmad-workflows.md (RU)

### Модифицировано файлов (11):
- [ ] workflow-engine.ts
- [ ] developer.agent.ts
- [ ] run.ts (CLI)
- [ ] agents.yaml
- [ ] developer.md
- [ ] architect.md
- [ ] scrum-master.md
- [ ] product-owner.md
- [ ] base-agent.ts
- [ ] README.md
- [ ] CHANGELOG.md

### Итого: 28 файлов

---

## Ресурсы

- **План**: `/Users/aliaksandrsmolka/.claude/plans/quirky-conjuring-unicorn-updated.md`
- **BMAD Analysis**: `/private/tmp/.../scratchpad/bmad-agents-analysis.md`
- **BMAD Method**: https://github.com/bmad-code-org/BMAD-METHOD
- **Existing workflows**: `packages/core/templates/workflows/`
- **Existing agents**: `packages/core/src/agents/roles/`

---

## Заметки

1. **КРИТИЧНО**: Всегда читай файлы перед модификацией (используй Read tool)
2. **КРИТИЧНО**: Не дублируй существующие workflows ([IR], [CC] уже есть!)
3. **КРИТИЧНО**: MenuCommandRouter должен работать с EXISTING workflows
4. **КРИТИЧНО**: TestEnforcementValidator должен БЛОКИРОВАТЬ при failed tests
5. **КРИТИЧНО**: PrincipleValidators в strict mode должны БЛОКИРОВАТЬ

---

**Готов к выполнению**: ✅
**Estimated time**: 5-7 недель
**Complexity**: High (28 файлов, 4 фазы, билингвальность)
**Breaking changes**: Минимальные (opt-in)

**Начинай с Фазы 1, День 1: MenuCommandRouter**

Удачи! 🚀
