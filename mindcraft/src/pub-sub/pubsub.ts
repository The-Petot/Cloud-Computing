import { getEnv } from '../utils';
import { PubSubResult } from '../types/global.type';
import { pubSubClient } from '..';
import { v4 } from 'uuid';

export function isPublishPubSubTaskError(
  result: { error: string } | string
): result is { error: string } {
  return (result as { error: string }).error !== undefined;
}

export async function publishSummaryTask(material: string) {
  const topic = pubSubClient.topic(getEnv('PUBSUB_TOPIC_ML_SUMMARY'));
  const taskId = v4();
  const payload = JSON.stringify({ taskId, text: material });
  try {
    const messageId = await topic.publishMessage({ data: payload });
    console.log(`Message ${messageId} published.`);
    return taskId;
  } catch (error) {
    return {
      error: `Unable to publish summary task: ${
        error instanceof Error ? error.message : 'Unknown error occured.'
      }`,
    };
  }
}

export async function publishGenerativeTask(material: string) {
  const topic = pubSubClient.topic(getEnv('PUBSUB_TOPIC_ML_GENERATE'));
  const taskId = v4();
  const payload = JSON.stringify({ taskId, text: material });
  try {
    const messageId = await topic.publishMessage({ data: payload });
    console.log(`Message ${messageId} published.`);
    return taskId;
  } catch (error) {
    return {
      error: `Unable to publish generative task: ${
        error instanceof Error ? error.message : 'Unknown error occured.'
      }`,
    };
  }
}

export async function listenForMessages(tasks: Map<string, PubSubResult>) {
  const subscription = pubSubClient.subscription(
    getEnv('PUBSUB_TOPIC_ML_RESULTS') + '-sub'
  );

  subscription.on('message', async (message) => {
    const data = message.data.toString('utf-8');
    const parsedData: PubSubResult = JSON.parse(data);
    tasks.set(parsedData.taskId, parsedData);
    message.ack();
  });

  subscription.on('error', async (error) => {
    console.error('Error in results subscription:', error.message);
  });
}

export function isPubSubTaskReachedTimeout(
  result: { error: string } | PubSubResult
): result is { error: string } {
  return (result as { error: string }).error !== undefined;
}

export async function waitForResults<T extends PubSubResult>(
  tasks: Map<string, PubSubResult>,
  taskId: string
): Promise<{ error: string } | T> {
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const result = tasks.get(taskId);
      if (result) {
        clearInterval(checkInterval);
        tasks.delete(taskId); // Clean up memory
        resolve(result as T);
      }
    }, 200);

    setTimeout(() => {
      clearInterval(checkInterval);
      reject({ error: 'Task has reached timeout: 60 seconds' });
    }, 60000);
  });
}
