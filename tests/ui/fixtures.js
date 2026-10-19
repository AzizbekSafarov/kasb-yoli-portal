import {test as base,expect} from '@playwright/test';
// Each isolated browser test represents a separate client. Use the reserved
// benchmarking range through the same proxy header Render provides; production
// rate limiting remains enabled and is tested separately against one client.
export const test=base.extend({extraHTTPHeaders:async({},use,testInfo)=>{
  const hash=[...testInfo.testId].reduce((sum,c)=>(sum*31+c.charCodeAt(0))>>>0,0);
  await use({'X-Forwarded-For':`198.18.${(hash>>>8)%255}.${hash%254+1}`});
}});
export {expect};
