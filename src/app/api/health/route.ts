import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Check database connection (optional)
    // You can add a simple database health check here if needed

    // Basic health check response
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
