import cron from 'node-cron'
import { checkMeetingsAndSendReminders } from './cron-logic'

// A global symbol to ensure the cron job is scheduled only once.
const CRON_JOB_SCHEDULED = Symbol.for('cron_job_scheduled')

/**
 * Schedules the cron job if it hasn't been scheduled already.
 * This function is designed to be safe to call multiple times.
 */
export function scheduleCronJob() {
  // Check if the job is already scheduled in the global scope
  if ((global as any)[CRON_JOB_SCHEDULED]) {
    console.log('Cron job has already been scheduled. Skipping.')
    return
  }

  console.log('Scheduling cron job...')

  // Schedule the job to run every 10 seconds
  cron.schedule('*/10 * * * * *', async () => {
    console.log('Executing scheduled job: checkMeetingsAndSendReminders')
    try {
      await checkMeetingsAndSendReminders()
    } catch (error) {
      console.error('Error in cron job execution:', error)
    }
  })

  // Mark the job as scheduled in the global scope.
  ;(global as any)[CRON_JOB_SCHEDULED] = true
  console.log('Cron job successfully scheduled to run every 10 seconds.')
}