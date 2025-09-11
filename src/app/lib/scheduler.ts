import cron from 'node-cron'
import { checkMeetingsAndSendReminders } from './cron-logic'

const CRON_JOB_SCHEDULED = Symbol.for('cron_job_scheduled')

export function scheduleCronJob() {
  if ((global as any)[CRON_JOB_SCHEDULED]) {
    console.log('Cron job has already been scheduled. Skipping.')
    return
  }

  console.log('Scheduling cron job to run every 10 seconds...')

  cron.schedule('* * * * *', async () => {
    console.log('Executing scheduled job: checkMeetingsAndSendReminders at', new Date().toISOString())
    try {
      const result = await checkMeetingsAndSendReminders()
      console.log('Cron job result:', JSON.stringify(result))
    } catch (error: any) {
      console.error('Error in cron job execution:', {
        message: error.message,
        stack: error.stack,
      })
    }
  })

  ;(global as any)[CRON_JOB_SCHEDULED] = true
  console.log('Cron job successfully scheduled.')
}