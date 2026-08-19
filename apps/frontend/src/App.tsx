import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-lg flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-medium tracking-tight">SuppAgent</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Edite <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">src/App.tsx</code> e
          salve para testar o HMR.
        </p>
      </div>
      <button
        type="button"
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-500"
        onClick={() => setCount((value) => value + 1)}
      >
        Count is {count}
      </button>
    </div>
  )
}

export default App
