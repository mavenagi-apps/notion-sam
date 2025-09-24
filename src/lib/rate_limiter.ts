import Bottleneck from 'bottleneck';

// Rate limiter for Notion API calls
export const notionApiLimiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100, // 100ms between requests
});

// Rate limiter for Maven AGI API calls
export const mavenApiLimiter = new Bottleneck({
  maxConcurrent: 50,
  minTime: 100, // 100ms between requests
});

// General purpose rate limiter
export const generalLimiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 200, // 200ms between requests
});

export default {
  notionApiLimiter,
  mavenApiLimiter,
  generalLimiter,
};
