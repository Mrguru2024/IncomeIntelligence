
import { createClient } from '@sanity/client';

const projectId = '5enbinz3';
const dataset = 'production';
const apiVersion = '2023-05-03';
const token = 'sklhlPEHDNeyktyXttfyrF9Ex7KH0UtkZm6rIRNbfaUNVwsWOGhNZiwdKdtpTZQ0GVZFrzu8vBXAZRff20R7Smj96wOICuk7A68KrY5aKn5AIKvD76XmbRwGxW1NeymEgnYyorF5XOkwMkwlL86RDWQSzKXc6T2izNYtecSKio3sYzWWQh21';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true
});
