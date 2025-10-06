import type { Config, Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  try {
    const { next_run }: { next_run: string } = await req.json();

    console.log('Received event! Next invocation at:', next_run);

    // TODO: Add your event refresh logic here
    // This is where you would implement the actual functionality
    // to refresh events from your data source

    return new Response(JSON.stringify({
      message: 'Event processed successfully',
      next_run,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing scheduled event:', error);

    return new Response(JSON.stringify({
      error: 'Failed to process scheduled event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const config: Config = {
  schedule: '@hourly',
};
