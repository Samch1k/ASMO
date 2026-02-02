# План: LLMProvider + Удаление LangChain

## Цели

1. **Работа через подписку Claude по умолчанию** ($0)
2. **API как опция** (для специфичных агентов/задач)
3. **Полное удаление LangChain** (~11 MB зависимостей)
4. **Расширяемость** для других провайдеров в будущем

---

## Текущее состояние

### Зависимости LangChain (удалить)

| Пакет | Размер |
|-------|--------|
| `@langchain/core` | 4.4 MB |
| `@langchain/anthropic` | 864 KB |
| `@langchain/langgraph` | 2.2 MB |
| `@langchain/langgraph-sdk` | 636 KB |
| `@langchain/langgraph-checkpoint` | 436 KB |
| `langsmith` | 2.5 MB |
| **Итого** | **~11 MB** |

### Использование LangChain в коде

- **28 агентов** → `ChatAnthropic` для LLM вызовов
- **types.ts** → `BaseMessage` для типа сообщений
- **learning-loop.ts** → `ChatAnthropic`
- **skill-matcher.ts** → `ChatAnthropic`, `BaseChatModel`

**Всего:** 95 использований, все заменяемы.

---

## Архитектура решения

```
┌─────────────────────────────────────────────────────────┐
│                      Agent                               │
│  (Developer, Architect, Tester, ...)                    │
│                                                          │
│  await this.callLLM(prompt, options)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  ILLMProvider                            │
│  generate(prompt, options): Promise<LLMResponse>        │
│  generateJSON<T>(prompt, options): Promise<T>           │
│  isAvailable(): boolean                                  │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Session       │ │ Anthropic     │ │ OpenAI        │
│ Provider      │ │ Provider      │ │ Provider      │
│ (claude CLI)  │ │ (@anthropic)  │ │ (будущее)     │
│ $0 подписка   │ │ API key       │ │               │
│ ПО УМОЛЧАНИЮ  │ │               │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## Фазы реализации

### ФАЗА 1: Типы и интерфейсы (1-2 часа)

#### 1.1 Создать типы сообщений (замена LangChain)

**Файл:** `packages/core/src/llm/types.ts`

```typescript
// =============================================================================
// MESSAGE TYPES (замена @langchain/core/messages)
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  role: MessageRole
  content: string
}

export interface UserMessage extends Message {
  role: 'user'
}

export interface AssistantMessage extends Message {
  role: 'assistant'
}

export interface SystemMessage extends Message {
  role: 'system'
}

// Фабрики для удобства (опционально)
export const createUserMessage = (content: string): UserMessage => ({
  role: 'user',
  content
})

export const createAssistantMessage = (content: string): AssistantMessage => ({
  role: 'assistant',
  content
})

export const createSystemMessage = (content: string): SystemMessage => ({
  role: 'system',
  content
})

// =============================================================================
// LLM PROVIDER TYPES
// =============================================================================

export type ModelTier = 'opus' | 'sonnet' | 'haiku'

export interface LLMGenerateOptions {
  /** Модель: opus, sonnet, haiku */
  model?: ModelTier
  /** Температура (0.0-1.0) */
  temperature?: number
  /** Максимум токенов в ответе */
  maxTokens?: number
  /** Системный промпт */
  systemPrompt?: string
  /** Таймаут в мс */
  timeout?: number
  /** История сообщений (для контекста) */
  messages?: Message[]
}

export interface LLMResponse {
  /** Текст ответа */
  content: string
  /** Использованная модель */
  model: string
  /** Статистика токенов (только для API) */
  usage?: {
    inputTokens: number
    outputTokens: number
  }
  /** Время выполнения в мс */
  duration: number
  /** Провайдер который обработал запрос */
  provider: string
}

export interface ILLMProvider {
  /** Уникальный ID провайдера */
  readonly id: string

  /** Название для логов */
  readonly name: string

  /** Стоимость: '$0' | 'pay-per-use' */
  readonly cost: string

  /** Проверить доступность провайдера */
  isAvailable(): boolean

  /** Сгенерировать текстовый ответ */
  generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse>

  /** Сгенерировать структурированный ответ (JSON) */
  generateJSON<T = unknown>(prompt: string, options?: LLMGenerateOptions): Promise<T>
}
```

---

### ФАЗА 2: Реализация провайдеров (4-6 часов)

#### 2.1 SessionLLMProvider (через Claude CLI)

**Файл:** `packages/core/src/llm/session-provider.ts`

```typescript
import { spawn } from 'child_process'
import type { ILLMProvider, LLMGenerateOptions, LLMResponse, ModelTier } from './types'

const MODEL_MAP: Record<ModelTier, string> = {
  opus: 'opus',
  sonnet: 'sonnet',
  haiku: 'haiku'
}

export class SessionLLMProvider implements ILLMProvider {
  readonly id = 'session'
  readonly name = 'Claude Code Session'
  readonly cost = '$0'

  private timeout: number
  private workingDirectory: string

  constructor(config?: { timeout?: number; workingDirectory?: string }) {
    this.timeout = config?.timeout || 120000
    this.workingDirectory = config?.workingDirectory || process.cwd()
  }

  isAvailable(): boolean {
    try {
      const { execSync } = require('child_process')
      execSync('claude --version', { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }

  async generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse> {
    const startTime = Date.now()
    const model = MODEL_MAP[options?.model || 'sonnet']

    const args = ['-p', prompt, '--model', model, '--output-format', 'text']

    const content = await this.execClaude(args)

    return {
      content,
      model,
      duration: Date.now() - startTime,
      provider: this.id
    }
  }

  async generateJSON<T = unknown>(prompt: string, options?: LLMGenerateOptions): Promise<T> {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only, no markdown.`
    const response = await this.generate(jsonPrompt, options)

    try {
      // Извлечь JSON из ответа (может быть обёрнут в ```)
      const jsonMatch = response.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(response.content)
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error}`)
    }
  }

  private execClaude(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('claude', args, {
        cwd: this.workingDirectory,
        timeout: this.timeout,
        env: { ...process.env }
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => { stdout += data.toString() })
      child.stderr.on('data', (data) => { stderr += data.toString() })

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim())
        } else {
          reject(new Error(`Claude CLI failed (code ${code}): ${stderr || stdout}`))
        }
      })

      child.on('error', (err) => {
        reject(new Error(`Failed to spawn Claude CLI: ${err.message}`))
      })
    })
  }
}
```

#### 2.2 AnthropicLLMProvider (через API)

**Файл:** `packages/core/src/llm/anthropic-provider.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { ILLMProvider, LLMGenerateOptions, LLMResponse, ModelTier, Message } from './types'

const MODEL_MAP: Record<ModelTier, string> = {
  opus: 'claude-opus-4-20250514',
  sonnet: 'claude-sonnet-4-20250514',
  haiku: 'claude-3-5-haiku-20241022'
}

export class AnthropicLLMProvider implements ILLMProvider {
  readonly id = 'anthropic'
  readonly name = 'Anthropic API'
  readonly cost = 'pay-per-use'

  private client: Anthropic | null = null

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      this.client = new Anthropic({ apiKey })
    }
  }

  isAvailable(): boolean {
    return this.client !== null
  }

  async generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error('ANTHROPIC_API_KEY not set')
    }

    const startTime = Date.now()
    const model = MODEL_MAP[options?.model || 'sonnet']

    // Построить сообщения
    const messages: Anthropic.MessageParam[] = []

    // Добавить историю если есть
    if (options?.messages) {
      for (const msg of options.messages) {
        if (msg.role !== 'system') {
          messages.push({ role: msg.role, content: msg.content })
        }
      }
    }

    // Добавить текущий промпт
    messages.push({ role: 'user', content: prompt })

    const response = await this.client.messages.create({
      model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature,
      system: options?.systemPrompt,
      messages
    })

    const textContent = response.content.find(c => c.type === 'text')
    const content = textContent?.type === 'text' ? textContent.text : ''

    return {
      content,
      model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      },
      duration: Date.now() - startTime,
      provider: this.id
    }
  }

  async generateJSON<T = unknown>(prompt: string, options?: LLMGenerateOptions): Promise<T> {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only.`
    const response = await this.generate(jsonPrompt, options)

    const jsonMatch = response.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(response.content)
  }
}
```

#### 2.3 LLMProviderFactory

**Файл:** `packages/core/src/llm/provider-factory.ts`

```typescript
import { SessionLLMProvider } from './session-provider'
import { AnthropicLLMProvider } from './anthropic-provider'
import type { ILLMProvider } from './types'

export type ProviderPreference = 'session' | 'anthropic' | 'auto'

export class LLMProviderFactory {
  private sessionProvider: SessionLLMProvider
  private anthropicProvider: AnthropicLLMProvider
  private defaultPreference: ProviderPreference

  constructor(defaultPreference: ProviderPreference = 'auto') {
    this.sessionProvider = new SessionLLMProvider()
    this.anthropicProvider = new AnthropicLLMProvider()
    this.defaultPreference = defaultPreference
  }

  getProvider(preference?: ProviderPreference): ILLMProvider {
    const pref = preference || this.defaultPreference

    switch (pref) {
      case 'session':
        if (!this.sessionProvider.isAvailable()) {
          throw new Error('Claude CLI not available. Install: https://claude.ai/code')
        }
        return this.sessionProvider

      case 'anthropic':
        if (!this.anthropicProvider.isAvailable()) {
          throw new Error('ANTHROPIC_API_KEY not set')
        }
        return this.anthropicProvider

      case 'auto':
      default:
        // Приоритет: session (бесплатно) → anthropic (платно)
        if (this.sessionProvider.isAvailable()) {
          return this.sessionProvider
        }
        if (this.anthropicProvider.isAvailable()) {
          console.warn('⚠️  Using Anthropic API (pay-per-use). Set up Claude CLI for $0 usage.')
          return this.anthropicProvider
        }
        throw new Error('No LLM provider available. Install Claude CLI or set ANTHROPIC_API_KEY.')
    }
  }

  /** Получить информацию о доступных провайдерах */
  getAvailableProviders(): { id: string; name: string; available: boolean; cost: string }[] {
    return [
      {
        id: this.sessionProvider.id,
        name: this.sessionProvider.name,
        available: this.sessionProvider.isAvailable(),
        cost: this.sessionProvider.cost
      },
      {
        id: this.anthropicProvider.id,
        name: this.anthropicProvider.name,
        available: this.anthropicProvider.isAvailable(),
        cost: this.anthropicProvider.cost
      }
    ]
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let factoryInstance: LLMProviderFactory | null = null

export function getLLMProviderFactory(): LLMProviderFactory {
  if (!factoryInstance) {
    factoryInstance = new LLMProviderFactory()
  }
  return factoryInstance
}

export function getLLMProvider(preference?: ProviderPreference): ILLMProvider {
  return getLLMProviderFactory().getProvider(preference)
}

export function resetLLMProviderFactory(): void {
  factoryInstance = null
}
```

#### 2.4 Index экспорты

**Файл:** `packages/core/src/llm/index.ts`

```typescript
// Types
export * from './types'

// Providers
export { SessionLLMProvider } from './session-provider'
export { AnthropicLLMProvider } from './anthropic-provider'

// Factory
export {
  LLMProviderFactory,
  getLLMProviderFactory,
  getLLMProvider,
  resetLLMProviderFactory,
  type ProviderPreference
} from './provider-factory'
```

---

### ФАЗА 3: Обновление BaseAgent (2-3 часа)

#### 3.1 Обновить types.ts

**Файл:** `packages/core/src/agents/types.ts`

```typescript
// УДАЛИТЬ:
// import { BaseMessage } from "@langchain/core/messages"

// ДОБАВИТЬ:
import type { Message } from '../llm/types'

export interface AgentState {
  // ИЗМЕНИТЬ:
  // messages: BaseMessage[]
  messages: Message[]  // ← Наш тип вместо LangChain

  // ... остальное без изменений
}
```

#### 3.2 Обновить BaseAgent

**Файл:** `packages/core/src/agents/base-agent.ts`

```typescript
import type { ILLMProvider, LLMGenerateOptions, Message } from '../llm/types'
import { getLLMProvider, type ProviderPreference } from '../llm/provider-factory'

export abstract class BaseAgent {
  protected agentId: string
  protected capabilities: string[]
  protected llmProvider: ILLMProvider

  constructor(
    agentId: string,
    capabilities: string[],
    providerPreference?: ProviderPreference
  ) {
    this.agentId = agentId
    this.capabilities = capabilities
    this.llmProvider = getLLMProvider(providerPreference)
  }

  /**
   * Установить конкретный провайдер
   */
  setLLMProvider(provider: ILLMProvider): void {
    this.llmProvider = provider
  }

  /**
   * Вызвать LLM и получить текстовый ответ
   */
  protected async callLLM(
    prompt: string,
    options?: LLMGenerateOptions
  ): Promise<string> {
    const response = await this.llmProvider.generate(prompt, options)
    this.log(`LLM response (${response.provider}, ${response.duration}ms)`)
    return response.content
  }

  /**
   * Вызвать LLM и получить JSON
   */
  protected async callLLMJSON<T = unknown>(
    prompt: string,
    options?: LLMGenerateOptions
  ): Promise<T> {
    return this.llmProvider.generateJSON<T>(prompt, options)
  }

  /**
   * Создать сообщение пользователя
   */
  protected createUserMessage(content: string): Message {
    return { role: 'user', content }
  }

  /**
   * Создать сообщение ассистента
   */
  protected createAssistantMessage(content: string): Message {
    return { role: 'assistant', content }
  }

  // ... остальные методы без изменений
}
```

---

### ФАЗА 4: Миграция агентов (6-10 часов)

#### 4.1 Шаблон миграции

**Было (LangChain):**
```typescript
import { ChatAnthropic } from "@langchain/anthropic"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"

export class DeveloperAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('developer', [...])
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.2
    })
  }

  async execute(state: AgentState) {
    const response = await this.llm.invoke([
      new SystemMessage("You are a developer..."),
      new HumanMessage(state.task)
    ])
    return { ... }
  }
}
```

**Стало (ILLMProvider):**
```typescript
// УДАЛИТЬ импорты LangChain!

export class DeveloperAgent extends BaseAgent {
  // УДАЛИТЬ private llm!

  constructor() {
    super('developer', [...])
    // llmProvider уже инициализирован в BaseAgent
  }

  async execute(state: AgentState) {
    const response = await this.callLLM(state.task, {
      model: 'sonnet',
      temperature: 0.2,
      systemPrompt: "You are a developer..."
    })
    return { ... }
  }
}
```

#### 4.2 Список агентов для миграции (28 штук)

**Скрипт для автоматизации части работы:**

```bash
# Найти все файлы с ChatAnthropic
grep -l "ChatAnthropic" packages/core/src/agents/roles/*.ts
```

**Чеклист:**

- [ ] architect.agent.ts
- [ ] developer.agent.ts
- [ ] tester.agent.ts
- [ ] debugger.agent.ts
- [ ] devops.agent.ts
- [ ] optimizer.agent.ts
- [ ] ui-developer.agent.ts
- [ ] ux-designer.agent.ts
- [ ] code-reviewer.agent.ts
- [ ] design-validator.agent.ts
- [ ] merge-coordinator.agent.ts
- [ ] post-deploy-monitor.agent.ts
- [ ] requirements-validator.agent.ts
- [ ] business-analyst.agent.ts
- [ ] project-manager.agent.ts
- [ ] product-owner.agent.ts
- [ ] api-designer.agent.ts
- [ ] data-architect.agent.ts
- [ ] performance-engineer.agent.ts
- [ ] scrum-master.agent.ts
- [ ] security-specialist.agent.ts
- [ ] product-manager.agent.ts
- [ ] rfq-specialist.agent.ts
- [ ] supplier-ops.agent.ts
- [ ] analyst.agent.ts
- [ ] tech-writer.agent.ts
- [ ] test-architect.agent.ts
- [ ] adversarial-reviewer.agent.ts

**Также обновить:**
- [ ] learning-loop.ts
- [ ] skill-matcher.ts

---

### ФАЗА 5: Удаление LangChain (1-2 часа)

#### 5.1 Удалить зависимости

```bash
cd packages/core
pnpm remove @langchain/anthropic @langchain/core
```

#### 5.2 Проверить что нет импортов

```bash
# Должно вернуть пустой результат
grep -r "@langchain" packages/core/src
```

#### 5.3 Обновить package.json

```json
// УДАЛИТЬ из dependencies:
"@langchain/anthropic": "...",
"@langchain/core": "..."

// Оставить:
"@anthropic-ai/sdk": "^0.71.2"
```

#### 5.4 Пересобрать и протестировать

```bash
pnpm install
pnpm build
pnpm test
```

---

### ФАЗА 6: Конфигурация провайдера (2-3 часа)

#### 6.1 Добавить в agents.yaml

```yaml
# packages/core/src/orchestration/config/agents.yaml

defaults:
  llm_provider: auto  # auto | session | anthropic
  model: sonnet

agents:
  developer:
    # Наследует defaults (session)
    model: sonnet

  architect:
    model: opus  # Более мощная модель для архитектуры

  security-specialist:
    llm_provider: anthropic  # Принудительно API для безопасности
    model: opus
```

#### 6.2 Обновить YamlConfigLoader

Добавить парсинг `llm_provider` из конфига агента.

---

## Структура файлов после миграции

```
packages/core/src/
├── llm/                          # НОВАЯ ПАПКА
│   ├── index.ts
│   ├── types.ts                  # Message, ILLMProvider
│   ├── session-provider.ts       # Claude CLI ($0)
│   ├── anthropic-provider.ts     # Anthropic SDK
│   └── provider-factory.ts       # Фабрика + singleton
├── agents/
│   ├── base-agent.ts             # + callLLM(), без ChatAnthropic
│   ├── types.ts                  # Message вместо BaseMessage
│   └── roles/
│       └── *.agent.ts            # Без ChatAnthropic
└── orchestration/
    ├── skill-matcher.ts          # Без ChatAnthropic
    └── learning-loop.ts          # Без ChatAnthropic
```

---

## Тестирование

### Unit тесты (добавить)

```typescript
// packages/core/tests/llm/session-provider.test.ts
describe('SessionLLMProvider', () => {
  it('should check CLI availability')
  it('should generate text response')
  it('should generate JSON response')
  it('should handle timeout')
})

// packages/core/tests/llm/anthropic-provider.test.ts
describe('AnthropicLLMProvider', () => {
  it('should check API key availability')
  it('should generate text response')
  it('should include usage stats')
})

// packages/core/tests/llm/provider-factory.test.ts
describe('LLMProviderFactory', () => {
  it('should return session provider by default')
  it('should fallback to anthropic if session unavailable')
  it('should throw if no provider available')
})
```

### E2E тесты

```bash
# Тест через подписку (без API key)
unset ANTHROPIC_API_KEY
asmo analyze "Create REST API"

# Тест через API
export ANTHROPIC_API_KEY=sk-...
asmo analyze "Create REST API" --provider anthropic
```

---

## Критерии успеха

- [ ] `asmo` работает БЕЗ `ANTHROPIC_API_KEY` (через подписку)
- [ ] По умолчанию используется Claude CLI (session)
- [ ] API доступен как опция (`--provider anthropic`)
- [ ] **LangChain полностью удалён** (0 импортов)
- [ ] Все 390+ тестов проходят
- [ ] Размер node_modules уменьшился на ~11 MB

---

## Оценка времени

| Фаза | Время | Описание |
|------|-------|----------|
| 1. Типы | 1-2 ч | types.ts с Message и ILLMProvider |
| 2. Провайдеры | 4-6 ч | Session + Anthropic + Factory |
| 3. BaseAgent | 2-3 ч | Интеграция callLLM() |
| 4. Миграция агентов | 6-10 ч | 28 агентов + 2 файла |
| 5. Удаление LangChain | 1-2 ч | Cleanup + тесты |
| 6. YAML конфиг | 2-3 ч | Настройки провайдера |
| **Итого** | **16-26 ч** |

---

## Расширяемость (будущее)

Добавить другие провайдеры легко:

```typescript
// packages/core/src/llm/openai-provider.ts
export class OpenAILLMProvider implements ILLMProvider {
  readonly id = 'openai'
  readonly name = 'OpenAI API'
  readonly cost = 'pay-per-use'

  // ... реализация
}

// Добавить в factory
```

Или перейти на Vercel AI SDK если нужно много провайдеров.

---

## Команда для старта

```bash
# 1. Создать ветку
git checkout -b feature/llm-provider-langchain-removal

# 2. Создать папку llm
mkdir -p packages/core/src/llm

# 3. Начать с Фазы 1 - types.ts
```

**Первый шаг:** Создать `packages/core/src/llm/types.ts`
