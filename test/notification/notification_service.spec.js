/* eslint-env mocha */
import { services } from 'test/factory'

describe('Notification Module Test Suite', () => {
  const eventService = services('eventService')
  const testEventName = 'TEST_EVENT'
  const testData = {
    name: 'TestName'
  }
  describe('Publish Event', () => {
    it('Should publish event', async () => {
      const response = await eventService.publishAppEvent(testEventName, testData, {
        isInternalEvent: true
      })
      expect(response).to.equal(true)
    })

    it('Should receive published event', async () => {
      await eventService.subscribeToAppEvent(testEventName, async ({ eventName }) => {
        expect(eventName).to.equal(testEventName)
      })
    })

  })
})
