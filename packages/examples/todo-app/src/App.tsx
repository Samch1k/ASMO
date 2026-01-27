import { TodoForm } from './components/TodoForm'
import { TodoItem } from './components/TodoItem'
import { useTodoStore } from './store'

function App() {
  const { todos, clearCompleted } = useTodoStore()

  const activeTodos = todos.filter((todo) => !todo.completed)
  const completedTodos = todos.filter((todo) => todo.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI1st Todo App
          </h1>
          <p className="text-gray-600">
            Simple demo showcasing autonomous development orchestration
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <TodoForm />
        </div>

        <div className="space-y-4">
          {activeTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Active Tasks ({activeTodos.length})
              </h2>
              <div className="space-y-2">
                {activeTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}

          {completedTodos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-700">
                  Completed ({completedTodos.length})
                </h2>
                <button
                  onClick={clearCompleted}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  Clear completed
                </button>
              </div>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}

          {todos.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No todos yet!</p>
              <p className="text-sm">Add a task to get started</p>
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>
            Built with AI1st orchestration system •{' '}
            <a
              href="https://github.com/Samch1k/ai1st-orchestration"
              className="text-blue-600 hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
