import * as fs from 'node:fs'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../../convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'

const filePath = 'count.txt'

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  )
}

const getCount = createServerFn({
  method: 'GET',
}).handler(() => {
  return readCount()
})

const updateCount = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount()
    await fs.promises.writeFile(filePath, `${count + data}`)
  })

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getCount(),
})

function Home() {
  const { data } = useSuspenseQuery(convexQuery(api.events.get, { limit: 10 }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Beacon Digest</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {data && data.length > 0 ? (
          <ul className="space-y-2">
            {data.map((event) => (
              <li key={event._id} className="border-b pb-2">
                <h3 className="font-medium">{event.name}</h3>
                {event.createdAt && (
                  <p className="text-sm text-gray-500">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found</p>
        )}
      </div>
    </div>
  )
}